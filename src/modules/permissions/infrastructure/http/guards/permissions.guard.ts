import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { type PermissionCheckerPort } from "@modules/permissions/domain/ports/permission-checker.port";
import { PERMISSIONS_KEY } from "@modules/permissions/infrastructure/http/decorators/require-permissions.decorator";
import { PERMISSION_CHECKER } from "@modules/permissions/permissions.tokens";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_CHECKER) private readonly permissionChecker: PermissionCheckerPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionChecker.hasPermission(userId, permission);
      if (!hasPermission) {
        throw new ForbiddenException(`Missing required permission: ${permission}`);
      }
    }

    return true;
  }
}
