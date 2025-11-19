import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { User } from 'src/user/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'];
    
    if (!auth) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = parts[1];
    
    try {
      // Vérifier et décoder le token
      const payload = this.jwtService.verify(token) as any;
      
      // ✅ Récupérer l'utilisateur complet depuis la DB
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // ✅ Attacher l'entité User complète à la requête
      (req as any).user = user;
      
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
