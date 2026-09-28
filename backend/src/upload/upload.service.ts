import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    // ── Cloudinary (images) ───────────────────────────────────────────────
    cloudinary.config({
      cloud_name: configService.get<string>('cloudinary.cloudName'),
      api_key:    configService.get<string>('cloudinary.apiKey'),
      api_secret: configService.get<string>('cloudinary.apiSecret'),
    });

    // ── Supabase Storage (3D GLB models, up to 50 MB free) ───────────────
    // Uses service_role key to bypass RLS — safe here since this is server-side only.
    const supabaseUrl = configService.get<string>('supabase.url') as string;
    const supabaseServiceKey = configService.get<string>('supabase.serviceKey') as string;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ── Image upload → Cloudinary ──────────────────────────────────────────
  async uploadImage(
    file: Express.Multer.File,
    folder = 'tunisia-car-rental',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result returned'));
          resolve(result);
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  // ── 3D GLB upload → Supabase Storage (no 10 MB cap, 50 MB free limit) ─
  async uploadRaw(
    fileBuffer: Buffer,
    filename: string,
    _folder = 'tunisia-car-rental/3d-models', // kept for API compatibility
  ): Promise<{ secure_url: string; public_id: string }> {
    const filePath = `${filename}.glb`;

    console.log(`[uploadRaw] Uploading ${fileBuffer.length} bytes → Supabase bucket "3d-models/${filePath}"`);

    const { error } = await this.supabase.storage
      .from('3d-models')
      .upload(filePath, fileBuffer, {
        contentType: 'model/gltf-binary',
        upsert: true, // overwrite if same name exists
      });

    if (error) {
      console.error('[uploadRaw] Supabase error:', error);
      throw new Error(`Supabase Storage: ${error.message}`);
    }

    // Build the public URL
    const { data } = this.supabase.storage
      .from('3d-models')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;
    console.log(`[uploadRaw] Done — public URL: ${publicUrl}`);

    return {
      secure_url: publicUrl,
      public_id: filePath,
    };
  }

  // ── Image delete → Cloudinary ─────────────────────────────────────────
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${filename}`;
  }
}
