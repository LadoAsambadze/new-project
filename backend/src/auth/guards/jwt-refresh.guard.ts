import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  override getRequest(context: ExecutionContext) {
    // Works for both REST and GQL contexts
    // For REST controllers: context is HTTP
    return context.switchToHttp().getRequest();
  }
}
