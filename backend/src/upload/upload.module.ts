import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ImageStorageService } from './image-storage.service';
import { ImagesController } from './images.controller';
import { StoredImage, StoredImageSchema } from './schemas/stored-image.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: StoredImage.name, schema: StoredImageSchema }])],
  providers: [UploadService, ImageStorageService],
  controllers: [UploadController, ImagesController],
  exports: [UploadService],
})
export class UploadModule {}
