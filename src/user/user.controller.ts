import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  Delete,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update_user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create_user.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { message } from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthReq } from 'src/types';

@ApiTags('user module')
@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async userLogin(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('blockuser/:userid')
  // @UseGuards(AuthGuard(), AdminGuard)
  async blockUser(@Param('userid') userid: string) {
    return this.userService.blockUser(userid);
  }
  @Post('unblockuser/:userid')
  // @UseGuards(AuthGuard(), AdminGuard)
  async unblockUser(@Param('userid') userid: string) {
    return this.userService.unBlockUser(userid);
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Get('admin-details')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), AdminGuard)
  AdminDetails(@Req() req: AuthReq) {
    return this.userService.getAdminDetails(req.user.id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.GetUser(id);
  }

  @Get('/email/:email')
  // @ApiOperation({ summary: 'Get a user by email' })
  @ApiOkResponse({
    status: 200,
    type: message,
  })
  async GetUserByEmail(@Param('email') email: string) {
    const result = await this.userService.findByEmail(email);

    if (result.user?.password == '') {
      return {
        message: 'User not found',
      };
    } else {
      return result;
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
