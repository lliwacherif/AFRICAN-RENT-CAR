import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { ImageStorageService } from './image-storage.service';

type ImageUploadResult = Pick<UploadApiResponse, 'secure_url' | 'public_id'> &
  Partial<Pick<UploadApiResponse, 'width' | 'height' | 'format'>>;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly configured: boolean;
  private readonly credentials: string[];

  constructor(configService: ConfigService, private readonly imageStorage: ImageStorageService) {
    const cloudName = configService.get<string>('cloudinary.cloudName')?.trim();
    const apiKey = configService.get<string>('cloudinary.apiKey')?.trim();
    const apiSecret = configService.get<string>('cloudinary.apiSecret')?.trim();
    this.configured = [cloudName, apiKey, apiSecret].every(value => value && !/^(your_|change[-_ ]?me|<)/i.test(value));
    this.credentials = [apiKey, apiSecret].filter((value): value is string => Boolean(value));
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  }

  private upload(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
    if (!this.configured) {
      throw new ServiceUnavailableException('Media storage is not configured. Set the Cloudinary credentials on the server.');
    }
    return new Promise((resolve, reject) => {
      const fail = (error: unknown) => {
        const message = error && typeof error === 'object' && 'message' in error
          ? String(error.message) : 'Cloudinary upload failed';
        this.logger.warn(this.credentials.reduce((text, credential) => text.split(credential).join('[redacted]'), message));
        reject(new BadGatewayException('Media upload failed. Please retry or check the Cloudinary configuration and storage limits.'));
      };
      try {
        const stream = cloudinary.uploader.upload_stream(
          { timeout: 120000, ...options },
          (error, result) => {
            if (error || !result?.secure_url) return fail(error);
            resolve(result);
          },
        );
        stream.on('error', fail);
        stream.end(buffer);
      } catch (error) {
        fail(error);
      }
    });
  }

  async uploadImage(file: Express.Multer.File, folder = 'tunisia-car-rental'): Promise<ImageUploadResult> {
    if (this.configured) {
      try {
        return await this.upload(file.buffer, {
          folder,
          resource_type: 'image',
          timeout: 10000,
          // Automatic format selection belongs in delivery URLs, never in an incoming transformation.
          transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
        });
      } catch {
        this.logger.warn('Cloudinary is unavailable; saving the image to MongoDB');
      }
    }
    return this.imageStorage.save(file);
  }

  uploadRaw(fileBuffer: Buffer, filename: string, folder = 'tunisia-car-rental/3d-models') {
    return this.upload(fileBuffer, { folder, resource_type: 'raw', public_id: filename, overwrite: false });
  }

  async deleteImage(publicId: string): Promise<void> {
    if (publicId.startsWith('stored-image-')) {
      return this.imageStorage.delete(publicId.slice('stored-image-'.length));
    }
    await cloudinary.uploader.destroy(publicId);
  }
}
