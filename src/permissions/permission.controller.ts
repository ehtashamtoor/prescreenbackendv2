import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionUserDto } from './dto/create-permission.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { PermissionsDTO } from 'src/utils/classes';
import { UserService } from 'src/user/user.service';
import { AuthReq } from 'src/types';
import { encryptData } from 'src/utils/encryptDecrypt';

@ApiTags('PermissionTemplate')
@Controller('/api')
export class PermissionController {
  constructor(
    private readonly templateService: PermissionService,
    private readonly userService: UserService,
  ) {}

  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Post('/create-permissionUserModel')
  @UseGuards(AuthGuard(), CompanyGuard)
  async create(@Body() dto: CreatePermissionUserDto, @Req() req: AuthReq) {
    // first create a user model
    const { email, password, role } = dto;
    const existingUser = await this.userService.findOneUserByemail(email);
    if (existingUser) {
      throw new BadRequestException('Email exists, Kindly use another email');
    }

    try {
      const hashedPass = await encryptData(password);
      const isCreated = await this.userService.create({
        email,
        password: hashedPass,
        userType: role,
        company: req.user.id,
        isEmailVerified: true,
      });
      // console.log('user created...', isCreated);

      // then create a permission user model
      const { userPermissions } = dto;

      const created = await this.templateService.create({
        user: isCreated.id,
        userPermissions,
      });

      return created;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/getPermissionsTemplate')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  // @UseGuards(AuthGuard())
  @ApiOperation({
    description: 'Get all Permissions',
  })
  @ApiOkResponse({
    type: PermissionsDTO,
  })
  findAll() {
    return this.templateService.findAll();
  }

  @Get('/getsinglePermision/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    type: CreatePermissionUserDto,
  })
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  // @Patch('/updatePermisson/:id')
  // @ApiResponse({
  //   status: 200,
  //   type: UpdateTagDto,
  // })
  // update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
  //   return this.templateService.update(id, updateTagDto);
  // }

  @Delete('/deletePermission/:id')
  // @UseGuards(AuthGuard(), AdminGuard)
  async remove(@Param('id') id: string) {
    return await this.templateService.remove(id);
  }
}
