import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly configured: boolean;

  constructor(configService: ConfigService) {
    const cloudName = configService.get<string>('cloudinary.cloudName');
    const apiKey = configService.get<string>('cloudinary.apiKey');
    const apiSecret = configService.get<string>('cloudinary.apiSecret');
    this.configured = Boolean(cloudName && apiKey && apiSecret);
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  }

  private upload(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
    if (!this.configured) {
      throw new ServiceUnavailableException('Media storage is not configured. Set the Cloudinary credentials on the server.');
    }
    return new Promise((resolve, reject) => {
      const fail = (error: unknown) => {
        this.logger.error(error instanceof Error ? error.message : 'Cloudinary upload failed');
        reject(new BadGatewayException('Media upload failed. Please retry or check the Cloudinary configuration and storage limits.'));
      };
      try {
        const stream = cloudinary.uploader.upload_stream(
          { ...options, timeout: 120000 },
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

  uploadImage(file: Express.Multer.File, folder = 'tunisia-car-rental') {
    return this.upload(file.buffer, {
      folder,
      resource_type: 'image',
      // Automatic format selection belongs in delivery URLs, never in an incoming transformation.
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    });
  }

  uploadRaw(fileBuffer: Buffer, filename: string, folder = 'tunisia-car-rental/3d-models') {
    return this.upload(fileBuffer, { folder, resource_type: 'raw', public_id: filename, overwrite: false });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
