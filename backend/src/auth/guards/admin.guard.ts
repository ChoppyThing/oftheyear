import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('🔍 AdminGuard - User:', user);
    console.log('🔍 AdminGuard - user.roles:', user?.roles); // ✅ Pluriel !

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ✅ Vérifier si 'admin' est dans le tableau roles
    if (!user.roles || !user.roles.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
