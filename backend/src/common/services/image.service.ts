import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

@Injectable()
export class ImageService {
  private readonly uploadDir = `${UPLOADS_DIR}/games`;

  /**
   * Traiter une image : redimensionner + convertir en WebP
   */
  async processGameImage(filePath: string): Promise<string> {
    const parsedPath = path.parse(filePath);
    const outputPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}.webp`,
    );

    // Si le fichier est déjà en webp, utiliser un fichier temporaire
    const tempPath = filePath === outputPath 
      ? path.join(parsedPath.dir, `${parsedPath.name}_temp.webp`)
      : outputPath;

    await sharp(filePath)
      .resize(800, 600, {
        fit: 'cover',
        position: 'attention',
      })
      .webp({ quality: 85 })
      .toFile(tempPath);

    // Supprimer l'image originale
    if (filePath !== outputPath) {
      await fs.unlink(filePath);
    }

    // Si on a utilisé un fichier temporaire, le renommer
    if (tempPath !== outputPath) {
      await fs.rename(tempPath, outputPath);
    }

    // Retourner le chemin relatif pour l'URL (uploads/games/xxx.webp)
    // En production UPLOADS_DIR=/data/uploads → /data/uploads/games/xxx.webp → uploads/games/xxx.webp
    // En dev UPLOADS_DIR=./uploads → ./uploads/games/xxx.webp → uploads/games/xxx.webp
    let relativePath = outputPath.replace(/^\.\//, ''); // Enlever ./ du début
    
    // Si le chemin contient /data/, extraire à partir de "uploads"
    if (relativePath.includes('/data/uploads/')) {
      relativePath = relativePath.substring(relativePath.indexOf('uploads/'));
    }
    
    return relativePath;
  }

  /**
   * Supprimer une image
   */
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(UPLOADS_DIR, imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}
