import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PermissionService } from 'src/permissions/permission.service';

@Injectable()
export class CompanyTeamGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reqPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    const user = context.switchToHttp().getRequest().user;
    const { userType } = user;
    // console.log(user);

    if (user && userType === 'company') {
      return true;
    }
    if (user && userType === 'candidate') {
      throw new UnauthorizedException(
        `You don't have enough permission to access thir route`,
      );
    }

    const permissionUserFound = await this.permissionService.findOneByUserId(
      user.id,
    );
    // console.log('peremisison user model found.....', permissionUserFound);
    // console.log('requred permisison for route');

    const hasPermission = Object.entries(
      permissionUserFound.userPermissions,
    ).some(([key, value]) => key === reqPermission && value === true);
    // console.log(hasPermission);

    // now check for permissions
    if (hasPermission) {
      return true;
    } else {
      throw new UnauthorizedException('You donot have enough permission');
    }
  }
}
