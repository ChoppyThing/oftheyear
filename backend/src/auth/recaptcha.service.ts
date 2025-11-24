import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly secretKey: string;
  private readonly minScore: number = 0.5; // Score minimum pour v3

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY') || '';
  }

  async verifyToken(
    token: string,
    expectedAction?: string,
  ): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.warn('RECAPTCHA_SECRET_KEY not configured, skipping validation');
      return true; // En dev sans clé configurée, on laisse passer
    }

    if (!token) {
      throw new UnauthorizedException('reCAPTCHA token is required');
    }

    try {
      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${this.secretKey}&response=${token}`,
        },
      );

      const data: RecaptchaResponse = await response.json();

      if (!data.success) {
        this.logger.error('reCAPTCHA verification failed', data['error-codes']);
        throw new UnauthorizedException('reCAPTCHA verification failed');
      }

      // Pour reCAPTCHA v3, vérifier le score
      if (data.score !== undefined && data.score < this.minScore) {
        this.logger.warn(
          `reCAPTCHA score too low: ${data.score} (min: ${this.minScore})`,
        );
        throw new UnauthorizedException(
          'reCAPTCHA verification failed: suspicious activity detected',
        );
      }

      // Vérifier que l'action correspond (optionnel mais recommandé)
      if (expectedAction && data.action !== expectedAction) {
        this.logger.warn(
          `reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`,
        );
        throw new UnauthorizedException('reCAPTCHA action mismatch');
      }

      this.logger.log(
        `reCAPTCHA verified successfully (score: ${data.score}, action: ${data.action})`,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error verifying reCAPTCHA', error);
      throw new UnauthorizedException('Failed to verify reCAPTCHA');
    }
  }
}
