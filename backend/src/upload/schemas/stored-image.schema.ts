import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'uploaded_images', timestamps: { createdAt: true, updatedAt: false } })
export class StoredImage {
  // The upload endpoint limits images to 5 MB, below MongoDB's document limit.
  @Prop({ type: Buffer, required: true, select: false })
  data: Buffer;

  @Prop({ required: true, enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'] })
  contentType: string;
}

export const StoredImageSchema = SchemaFactory.createForClass(StoredImage);
