import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoredImage } from './schemas/stored-image.schema';

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

  constructor(@InjectModel(StoredImage.name) private readonly images: Model<StoredImage>) {}

  async save(file: Express.Multer.File) {
    try {
      const image = await this.images.create({ data: file.buffer, contentType: file.mimetype });
      return {
        secure_url: `/api/upload/images/${image.id}`,
        public_id: `stored-image-${image.id}`,
        format: file.mimetype.split('/')[1],
      };
    } catch {
      this.logger.error('Could not save an uploaded image to MongoDB');
      throw new ServiceUnavailableException('Image storage is unavailable. Please retry.');
    }
  }

  async get(id: string) {
    if (!/^[a-f\d]{24}$/i.test(id)) throw new NotFoundException('Image not found');
    const image = await this.images.findById(id).select('+data').exec();
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async delete(id: string): Promise<void> {
    if (!/^[a-f\d]{24}$/i.test(id)) throw new NotFoundException('Image not found');
    await this.images.deleteOne({ _id: id }).exec();
  }
}
