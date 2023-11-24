import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Injectable()
export class UploadService {
  readonly isMulter = this.configService.get('SERVER_TYPE') === 'multer';
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private configService: ConfigService,
  ) {}
  async upload(file: Express.Multer.File) {
    const { originalname, path } = file;
    if (this.isMulter) {
      // console.log('url', join(this.configService.get('DOMAIN')!, path));
      // console.log('path', path);
      return {
        url: join(this.configService.get('DOMAIN')!, path),
        path,
        originalname,
      };
    } else {
      // const result = ({ secure_url, public_id } =
      const result = await this.cloudinaryService.uploadFile(file, 'uploads');
      // console.log('result', result);
      const lastSlashIndex = result.secure_url.lastIndexOf('/');
      const desiredPath = result.secure_url.substring(lastSlashIndex + 1);
      // console.log('desiredPath', desiredPath);
      return {
        url: result.secure_url,
        path: desiredPath,
        originalname,
      };
    }
  }
  uploads(files: Express.Multer.File[]) {
    return files.map((file) => {
      return this.upload(file);
    });
  }
  // download(path: string, res: Response) {
  //   const url = join(__dirname, '../', path);
  //   res.download(url);
  // }
  // async update(file: Express.Multer.File, oldFilePath: string, userId: string) {
  //   const oldPath = join('./uploads', userId, oldFilePath);
  //   await this.remove(oldPath, userId);
  //   await this.upload(file);
  // }
  async remove(filePath: string, userId: string) {
    // console.log('filepath', filePath);
    if (this.isMulter) {
      const path = join('./uploads', userId, filePath);
      await fs.unlink(path);
    } else {
      const path = 'uploads/' + filePath.split('.')[0];
      const isDeleted = await this.cloudinaryService.deleteFile(path);
      if (isDeleted) {
        return { message: 'Image deleted' };
      }
    }
  }
}
