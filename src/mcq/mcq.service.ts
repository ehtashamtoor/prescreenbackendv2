import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MCQ } from './entities/mcq.entity';
import { CreateMCQDto } from './dto/create-mcq.dto';
import { MCQSearchDto } from './dto/searchMcq.dto';

@Injectable()
export class McqService {
  constructor(@InjectModel(MCQ.name) private MCQModel: Model<MCQ>) {}

  searchMCQs(searchDto: MCQSearchDto): MCQ[] | Promise<MCQ[]> {
    const { difficultyLevel, language, tags, title } = searchDto;

    const query: any = {};

    if (title) {
      query['title'] = { $regex: title, $options: 'i' };
    }

    if (language) {
      query['language'] = language;
    }

    if (difficultyLevel) {
      query['difficultyLevel'] = difficultyLevel;
    }

    if (tags) {
      query['tags'] = { $in: tags };
    }

    return this.MCQModel.find(query);
  }

  async createMCQ(mcqDocs: CreateMCQDto[]) {
    await this.MCQModel.insertMany(mcqDocs);
    return {
      message: 'Mcqs Created Successfully',
    };
  }

  async getAllMCQ(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.MCQModel.aggregate([
        {
          $facet: {
            questions: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);

      //   questions = await this.MCQModel.find().skip(skip).limit(limit).exec();
      //   totalDocs = await this.MCQModel.countDocuments();
      // } else {
      //   questions = await this.MCQModel.find().exec();
      //   totalDocs = await this.MCQModel.countDocuments();
      // }
    } else {
      result = await this.MCQModel.aggregate([
        {
          $facet: {
            questions: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const questions = result[0].questions;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      mcqQuestions: questions,
      total: totalDocs,
    };
  }

  async getByCompany(id: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.MCQModel.aggregate([
        {
          $facet: {
            questions: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.MCQModel.aggregate([
        {
          $facet: {
            questions: [{ $match: matchStage }],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }
    const questions = result[0].questions;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    return {
      mcqQuestions: questions,
      total: totalDocs,
    };
  }

  async getById(id: string) {
    const MCQ = await this.MCQModel.findById(id).exec();
    if (!MCQ) {
      throw new NotFoundException('MCQ not found');
    }
    return MCQ;
  }

  async updateMCQ(userId: string, id: string, updateMcqDto: UpdateMcqDto) {
    const updatedMCQs = await this.MCQModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      updateMcqDto,
      {
        new: true,
      },
    );

    if (!updatedMCQs) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
      // (
      //   'Only the creator company has exclusive editing rights for this question.',
      // );
    }

    return updatedMCQs;
  }

  async deleteMCQ(id: string, userid: string) {
    const isDeleted = await this.MCQModel.findOneAndDelete({
      createdBy: userid,
      id,
    });
    if (!isDeleted) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }
    if (isDeleted) {
      return { message: 'Mcq Deleted Successfully' };
    }
  }

  async getTotalLength() {
    return (await this.MCQModel.countDocuments()).toString();
  }

  // async getQuestionsByDifficulty(userId: string) {
  //   const easyQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'easy',
  //     createdBy: userId,
  //   });
  //   if (!easyQuestions) {
  //     throw new NotFoundException(`No easy Mcqs found`);
  //   }
  //   const mediumQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'medium',
  //     createdBy: userId,
  //   });
  //   if (!mediumQuestions) {
  //     throw new NotFoundException(`No medium Mcqs found`);
  //   }
  //   const hardQuestions = await this.MCQModel.find({
  //     difficultyLevel: 'hard',
  //     createdBy: userId,
  //   });
  //   if (!hardQuestions) {
  //     throw new NotFoundException(`No hard Mcqs found`);
  //   }

  //   return {
  //     easy: easyQuestions.length,
  //     medium: mediumQuestions.length,
  //     hard: hardQuestions.length,
  //   };
  // }

  // async getQuestionsByDifficulty(language: string) {
  //   const query: any = {
  //     $or: [
  //       { difficultyLevel: 'easy' },
  //       { difficultyLevel: 'medium' },
  //       { difficultyLevel: 'hard' },
  //     ],
  //   };

  //   if (language) {
  //     // Check if the user-provided language exists in the database
  //     const languageExists = await this.MCQModel.findOne({
  //       language,
  //     });

  //     if (languageExists) {
  //       // const languageRegex = new RegExp(language, 'i');
  //       query['language'] = language;
  //     } else {
  //       throw new NotFoundException('Provided language is not present in MCQS');
  //     }
  //   }

  //   const questions = await this.MCQModel.find(query);

  //   if (!questions || questions.length === 0) {
  //     throw new NotFoundException('No MCQs found');
  //   }

  //   const filteredQuestions = questions.reduce((result: any, question) => {
  //     // Group questions by difficulty level
  //     const difficultyLevel = question.difficultyLevel;
  //     if (!result[difficultyLevel]) {
  //       result[difficultyLevel] = [];
  //     }
  //     result[difficultyLevel].push(question);
  //     // console.log(result[difficultyLevel]);

  //     return result;
  //   }, {});
  //   // console.log(filteredQuestions);

  //   return {
  //     easy: filteredQuestions['easy'] ? filteredQuestions['easy'].length : 0,
  //     medium: filteredQuestions['medium']
  //       ? filteredQuestions['medium'].length
  //       : 0,
  //     hard: filteredQuestions['hard'] ? filteredQuestions['hard'].length : 0,
  //   };
  // }

  async getQuestionsByLangTags(language: string, tags: string[]) {
    const query: any = {
      $or: [
        { difficultyLevel: 'easy' },
        { difficultyLevel: 'medium' },
        { difficultyLevel: 'hard' },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided and not empty
    if (tags && tags.length > 0) {
      // Find questions that have any of the provided tags
      query['tags'] = { $in: tags };
    }
    // console.log(query);

    const questions = await this.MCQModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log(filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getMcqsByLangTagsComp(id: string, language: string, tags: string[]) {
    const query: any = {
      createdBy: id,
      $or: [
        { difficultyLevel: 'easy' },
        { difficultyLevel: 'medium' },
        { difficultyLevel: 'hard' },
      ],
    };
    if (language) {
      query['language'] = language;
    }

    // Check if tags array is provided and not empty
    if (tags && tags.length > 0) {
      // Find questions that have any of the provided tags
      query['tags'] = { $in: tags };
    }
    // console.log(query);

    const questions = await this.MCQModel.find(query);

    const filteredQuestions = questions.reduce((result: any, question) => {
      // Group questions by difficulty level
      const difficultyLevel = question.difficultyLevel;
      if (!result[difficultyLevel]) {
        result[difficultyLevel] = { id: [], count: 0 };
      }
      result[difficultyLevel].id.push(question._id);
      result[difficultyLevel].count++;

      return result;
    }, {});
    // console.log(filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByDiffTags(
    language: string,
    tags: string[],
    size: number[],
  ) {
    let questions = await this.MCQModel.collection
      .aggregate([
        {
          $match: {
            language,
            tags: { $in: tags },
            difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
          },
        },
        {
          $facet: {
            easyQuestions: [
              {
                $match: { difficultyLevel: 'easy' },
              },
              {
                $sample: { size: size[0] },
              },
              {
                $project: {
                  _id: 1,
                  // language: 1,
                  // difficultyLevel: 1,
                  // Add other properties for easy questions here
                },
              },
            ],
            mediumQuestions: [
              {
                $match: { difficultyLevel: 'medium' },
              },
              {
                $sample: { size: size[1] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for medium questions here
                },
              },
            ],
            hardQuestions: [
              {
                $match: { difficultyLevel: 'hard' },
              },
              {
                $sample: { size: size[2] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for hard questions here
                },
              },
            ],
          },
        },
        {
          $project: {
            allQuestions: {
              $concatArrays: [
                '$easyQuestions',
                '$mediumQuestions',
                '$hardQuestions',
              ],
            },
          },
        },
      ])
      .toArray();

    questions = questions[0].allQuestions.map((value: any) => value._id);
    // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

    // console.log(questions);

    // return questionIdsAsStrings;
    return questions;
  }

  async getQuestionsByDiffTagsComp(
    id: string,
    language: string,
    tags: string[],
    size: number[],
  ) {
    let questions = await this.MCQModel.collection
      .aggregate([
        {
          $match: {
            createdBy: id,
            language,
            tags: { $in: tags },
            difficultyLevel: { $in: ['easy', 'medium', 'hard'] },
          },
        },
        {
          $facet: {
            easyQuestions: [
              {
                $match: { difficultyLevel: 'easy' },
              },
              {
                $sample: { size: size[0] },
              },
              {
                $project: {
                  _id: 1,
                  // language: 1,
                  // difficultyLevel: 1,
                  // Add other properties for easy questions here
                },
              },
            ],
            mediumQuestions: [
              {
                $match: { difficultyLevel: 'medium' },
              },
              {
                $sample: { size: size[1] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for medium questions here
                },
              },
            ],
            hardQuestions: [
              {
                $match: { difficultyLevel: 'hard' },
              },
              {
                $sample: { size: size[2] },
              },
              {
                $project: {
                  _id: 1,
                  language: 1,
                  difficultyLevel: 1,
                  // Add other properties for hard questions here
                },
              },
            ],
          },
        },
        {
          $project: {
            allQuestions: {
              $concatArrays: [
                '$easyQuestions',
                '$mediumQuestions',
                '$hardQuestions',
              ],
            },
          },
        },
      ])
      .toArray();

    questions = questions[0].allQuestions.map((value: any) => value._id);
    // const questionIdsAsStrings = questions.map((value: any) => value._id.toString());

    // console.log(questions);

    // return questionIdsAsStrings;
    return questions;
  }
}
