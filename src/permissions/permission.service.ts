import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PermissionsUserModel } from './entities/permission.entity';
import { TemplatePerObj } from 'src/utils/classes';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(PermissionsUserModel.name)
    private tempPerModel: Model<PermissionsUserModel>,
  ) {}

  create(dto: { user: string; userPermissions: TemplatePerObj }) {
    return this.tempPerModel.create(dto);
  }

  async findAll() {
    const allPermissions = {
      candidate_applications: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      assesments: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      codingQuestions: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      mcqs: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      examInvites: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      exams: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      jobs: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
      tags: [
        { read: false },
        { write: false },
        { update: false },
        { del: false },
      ],
    };

    return allPermissions;
  }

  async findOne(id: string) {
    // console.log(userId);
    const permissionModelFound = await this.tempPerModel
      .findOne({
        _id: id,
      })
      .populate({
        path: 'user',
        select: 'password lastLogin',
        populate: {
          path: 'company',
          model: 'Company',
        },
      });

    if (!permissionModelFound) {
      throw new NotFoundException('No Permission user model found');
    }
    return permissionModelFound;
  }

  async findOneByUserId(userid: string) {
    // console.log(userId);
    const permissionModelFound = await this.tempPerModel
      .findOne({
        user: userid,
      })
      .populate({
        path: 'user',
        select: 'password userType lastLogin',
        populate: {
          path: 'company',
          model: 'User',
          select: 'name email website industry',
        },
      });

    if (!permissionModelFound) {
      throw new NotFoundException('No Permission user model found');
    }
    return permissionModelFound;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    // console.log(updateTagDto);
    const isUpdated = await this.tempPerModel.findByIdAndUpdate(
      id,
      updateTagDto,
      {
        new: true,
      },
    );

    if (!isUpdated) {
      throw new NotFoundException('No Tag found');
    }

    return {
      message: 'Tag Updated Successfully',
    };
  }

  async remove(id: string) {
    console.log(id);
  }
}
