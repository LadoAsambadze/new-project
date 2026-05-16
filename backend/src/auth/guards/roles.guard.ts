import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { getGqlRequest } from '../../common/gql-context.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let user: { role?: string } | undefined;
    try {
      const req = getGqlRequest(context);
      user = req.user as { role?: string } | undefined;
    } catch {
      const req = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
      user = req.user;
    }

    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  }
}
