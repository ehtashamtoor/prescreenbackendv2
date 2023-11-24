import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './entities/tag.entity';
import { MCQ } from 'src/mcq/entities/mcq.entity';
import { CodingQuestion } from 'src/coding-question/entities/coding-question.entity';
import { Exam } from 'src/exam/entities/exam.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name) private TagModel: Model<Tag>,
    @InjectModel(MCQ.name) private McqModel: Model<MCQ>,
    @InjectModel(CodingQuestion.name)
    private CodingModel: Model<CodingQuestion>,
    @InjectModel(Exam.name) private ExamModel: Model<Exam>,
  ) {}

  create(dto: CreateTagDto) {
    return this.TagModel.create(dto);
  }

  async findAll(page?: number, limit?: number) {
    let result;
    const lookup1 = {
      $lookup: {
        from: 'users', // collection named from which lookup
        localField: 'candidate', // collection field to be lookup from other
        foreignField: '_id',
        as: 'candidateInfo',
        pipeline: [{ $project: { name: 1, email: 2 } }], // fields to populate
      },
    };
    // TODO add populate
    // let questions;
    // if (page && limit) {
    //   const skip = (page - 1) * limit;
    //   if (skip < 0) {
    //     questions = await this.TagModel.find()
    //       .limit(limit)
    //       .populate({
    //         path: 'user',
    //         select: 'password lastLogin',
    //         populate: {
    //           path: 'company',
    //           model: 'Company',
    //         },
    //       });
    //   } else {
    //     questions = await this.TagModel.find()
    //       .skip(skip)
    //       .limit(limit)
    //       .populate({
    //         path: 'user',
    //         select: 'password lastLogin',
    //         populate: {
    //           path: 'company',
    //           model: 'Company',
    //         },
    //       });
    //   }
    // } else {
    //   questions = await this.TagModel.find().populate({
    //     path: 'user',
    //     select: 'password lastLogin',
    //     populate: {
    //       path: 'company',
    //       model: 'Company',
    //     },
    //   });
    // }
    // return questions;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.TagModel.aggregate([
        {
          $facet: {
            tags: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      // tags: [lookup1],
      result = await this.TagModel.aggregate([
        {
          $facet: {
            tags: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const tags = result[0].tags;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      allTags: tags,
      total: totalDocs,
    };
  }

  async findOne(id: string) {
    // console.log(userId);
    const tagFound = await this.TagModel.findOne({
      _id: id,
    }).populate({
      path: 'user',
      select: 'password lastLogin', // choosing required fields
      populate: {
        path: 'company',
        model: 'Company',
      },
    });

    if (!tagFound) {
      throw new NotFoundException('No Tag found');
    }
    return tagFound;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    // console.log(updateTagDto);
    const isUpdated = await this.TagModel.findByIdAndUpdate(id, updateTagDto, {
      new: true,
    });

    if (!isUpdated) {
      throw new NotFoundException('No Tag found');
    }

    return {
      message: 'Tag Updated Successfully',
    };
  }

  async remove(id: string) {
    // Check if the tag is used in any MCQ, CodingQuestion, or Exam
    const usedInMCQ = await this.McqModel.find({ tags: id });
    const usedInCoding = await this.CodingModel.find({ tags: id });
    const usedInExams = await this.ExamModel.find({ tags: id });

    // console.log(usedInMCQ);
    // return;

    // Prepare a list of resources where the tag is used
    const usedInResources = [];
    if (usedInMCQ)
      usedInResources.push([
        ...usedInMCQ.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);
    if (usedInCoding)
      usedInResources.push([
        ...usedInCoding.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);
    if (usedInExams)
      usedInResources.push([
        ...usedInExams.map((item) => {
          return {
            id: item.id,
            title: item.title,
          };
        }),
      ]);

    // console.log('associations with tags', usedInResources);
    // console.log(usedInResources);
    // return true;
    const allArraysEmpty = usedInResources.every(
      (arr: any[]) => arr.length === 0,
    );
    if (!allArraysEmpty) {
      // The tag is used in some resources, return a response indicating where it's used
      throw new BadRequestException(
        'This tag cannot be deleted as it is being used',
      );
      // return {
      //   message: 'Tag is used in the following resources:',
      //   usedIn: usedInResources,
      // };
    } else {
      // The tag is not used in any resources, proceed with deletion
      const isDeleted = await this.TagModel.findByIdAndDelete(id);

      if (!isDeleted) {
        throw new NotFoundException('No Tag found');
      }

      return {
        message: 'Tag deleted Successfully',
      };
    }
  }
}
