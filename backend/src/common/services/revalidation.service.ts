import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly frontendUrl: string;
  private readonly revalidateSecret: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.frontendUrl = this.config.get('FRONTEND_URL') || 'https://game.oftheyear.eu';
    this.revalidateSecret = this.config.get('REVALIDATE_SECRET');
  }

  /**
   * Revalider la page d'accueil (liste des derniers jeux)
   */
  async revalidateHome(): Promise<void> {
    if (!this.revalidateSecret) {
      this.logger.warn('REVALIDATE_SECRET not configured, skipping revalidation');
      return;
    }

    try {
      const locales = ['en', 'fr', 'es', 'zh'];
      
      for (const locale of locales) {
        const url = `${this.frontendUrl}/internal/revalidate?secret=${this.revalidateSecret}&path=/${locale}`;
        const response = await fetch(url, { method: 'POST' });
        
        if (response.ok) {
          this.logger.log(`Revalidated home page for locale: ${locale}`);
        } else {
          this.logger.error(`Failed to revalidate home for ${locale}: ${response.statusText}`);
        }
      }
    } catch (error) {
      this.logger.error('Error revalidating home page', error);
    }
  }

  /**
   * Revalider une page de catégorie spécifique
   */
  async revalidateCategory(categorySlug: string): Promise<void> {
    if (!this.revalidateSecret) {
      this.logger.warn('REVALIDATE_SECRET not configured, skipping revalidation');
      return;
    }

    try {
      const locales = ['en', 'fr', 'es', 'zh'];
      
      for (const locale of locales) {
        const url = `${this.frontendUrl}/internal/revalidate?secret=${this.revalidateSecret}&path=/${locale}/category/${categorySlug}`;
        const response = await fetch(url, { method: 'POST' });
        
        if (response.ok) {
          this.logger.log(`Revalidated category ${categorySlug} for locale: ${locale}`);
        } else {
          this.logger.error(`Failed to revalidate category ${categorySlug} for ${locale}: ${response.statusText}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error revalidating category ${categorySlug}`, error);
    }
  }

  /**
   * Revalider le sitemap
   */
  async revalidateSitemap(): Promise<void> {
    if (!this.revalidateSecret) {
      this.logger.warn('REVALIDATE_SECRET not configured, skipping revalidation');
      return;
    }

    try {
      const url = `${this.frontendUrl}/internal/revalidate?secret=${this.revalidateSecret}&path=/sitemap.xml`;
      const response = await fetch(url, { method: 'POST' });
      
      if (response.ok) {
        this.logger.log('Revalidated sitemap');
      } else {
        this.logger.error(`Failed to revalidate sitemap: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error revalidating sitemap', error);
    }
  }
}
