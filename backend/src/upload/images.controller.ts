import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ImageStorageService } from './image-storage.service';

@ApiTags('Upload')
@Controller('upload/images')
export class ImagesController {
  constructor(private readonly imageStorage: ImageStorageService) {}

  // Vehicle photos must also be visible to visitors without an admin session.
  @Get(':id')
  @ApiOperation({ summary: 'View an uploaded image' })
  async getImage(@Param('id') id: string, @Res() response: Response): Promise<void> {
    const image = await this.imageStorage.get(id);
    response.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    response.send(image.data);
  }
}
