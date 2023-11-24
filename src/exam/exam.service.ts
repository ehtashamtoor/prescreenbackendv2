import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import mongoose, { Model } from 'mongoose';
import { Exam } from './entities/exam.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ExamService {
  constructor(@InjectModel(Exam.name) private ExamModel: Model<Exam>) {}

  async create(dto: CreateExamDto) {
    const createdQuestion = new this.ExamModel(dto);
    return createdQuestion.save();
  }

  async findAll(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.ExamModel.aggregate([
        {
          $facet: {
            exams: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.ExamModel.aggregate([
        {
          $facet: {
            exams: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const exams = result[0].exams;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      exams: exams,
      total: totalDocs,
    };
  }

  async findByCompany(id: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.ExamModel.aggregate([
        {
          $facet: {
            exams: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.ExamModel.aggregate([
        {
          $facet: {
            exams: [{ $match: matchStage }],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }
    const exams = result[0].exams;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    if (exams.length == 0) {
      throw new NotFoundException('Company has no Exams');
    }
    return {
      exams: exams,
      total: totalDocs,
    };
  }

  async findOne(id: string) {
    const Exam = await this.ExamModel.findOne({
      _id: id,
    });

    if (!Exam) {
      throw new NotFoundException('Exam not found');
    }

    return Exam;
  }

  async update(id: string, userid: string, updateExamDto: UpdateExamDto) {
    const updatedQuestion = await this.ExamModel.findOneAndUpdate(
      { _id: id, createdBy: userid },
      updateExamDto,
      { new: true },
    );

    if (!updatedQuestion) {
      throw new ConflictException('Unauthorized editing or invalid id');
    }
    return updatedQuestion;
  }

  async remove(id: string, userid: string) {
    const isDeleted = await this.ExamModel.findOneAndUpdate({
      _id: id,
      createdBy: userid,
    });

    if (!isDeleted) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }

    return {
      message: 'Exam deleted Successfully',
    };
  }

  async findById(id: string) {
    return await this.ExamModel.findById(id);
  }
}
