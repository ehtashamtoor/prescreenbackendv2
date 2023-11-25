import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
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
import { TagsResponseDto, paginationDto } from 'src/utils/classes';

@ApiTags('Tags')
@Controller('/api')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @Post('/create-tag')
  @UseGuards(AuthGuard(), CompanyGuard)
  create(@Body() dto: CreateTagDto, @Req() req: any) {
    const { id } = req.user;

    // set Logged userId in user field
    dto.user = id;

    return this.tagService.create(dto);
  }

  @Get('/getTags')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({
    description: 'Get all tags',
    summary: 'Get all tags or paginate them',
  })
  @ApiOkResponse({
    type: TagsResponseDto,
  })
  findAll(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.tagService.findAll(page, limit);
    } else {
      return this.tagService.findAll();
    }
  }

  @Get('/getTag/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiSecurity('JWT-auth')
  @ApiResponse({
    status: 200,
    type: CreateTagDto,
  })
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch('/updateTag/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiResponse({
    status: 200,
    type: UpdateTagDto,
  })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete('/deleteTag/:id')
  // @UseGuards(AuthGuard(), AdminGuard)
  async remove(@Param('id') id: string) {
    return await this.tagService.remove(id);
  }
}
