import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { auth } from '../auth/auth';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();

    try {
      const session = await auth.api.getSession({
        headers: request.headers as Record<string, string>,
      });

      if (!session || !session.user) {
        throw new UnauthorizedException('Usuário não autenticado');
      }

      const userRole = session.user.role;

      if (userRole !== 'admin') {
        throw new ForbiddenException(
          'Acesso negado. Apenas administradores podem acessar este recurso.',
        );
      }

      request.user = session.user;

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}
