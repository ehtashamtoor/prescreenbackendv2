import {
  Controller,
  Post,
  Param,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { UploadService } from './file.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('upload files')
@Controller('/api/file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // @UseGuards(AuthGuard())
  @Post('upload')
  // @ApiBearerAuth()
  // @ApiSecurity('JWT-auth')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        originalname: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    // console.log(file);
    return this.uploadService.upload(file);
  }

  @Post('uploads')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files')) // 👈  using FilesInterceptor here
  @ApiBody({
    schema: {
      type: 'array',
      properties: {
        files: {
          type: 'array', // 👈  array of files
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  uploads(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploads(files);
  }

  @Delete(':path')
  @UseGuards(AuthGuard())
  remove(@Param('path') path: string, @Req() req: any) {
    const { id } = req.user;
    return this.uploadService.remove(path, id);
  }
}
