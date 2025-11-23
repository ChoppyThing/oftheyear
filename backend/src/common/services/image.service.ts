import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImageService {
  private readonly uploadDir = './uploads/games';

  /**
   * Traiter une image : redimensionner + convertir en WebP
   */
  async processGameImage(filePath: string): Promise<string> {
    const parsedPath = path.parse(filePath);
    const outputPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}.webp`,
    );

    await sharp(filePath)
      .resize(800, 600, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Supprimer l'image originale
    if (filePath !== outputPath) {
      await fs.unlink(filePath);
    }

    return outputPath.replace('./uploads/', '');
  }

  /**
   * Supprimer une image
   */
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join('./uploads', imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}
