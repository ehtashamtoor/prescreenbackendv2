import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CodingQuestionDto } from './dto/create-coding-question.dto';
import { CodingQuestion } from './entities/coding-question.entity';
import { UpdateCodingQuestionDto } from './dto/update-coding-question.dto';
import { CodingSearchDto } from './dto/searcCodingQuestion.dto';

@Injectable()
export class CodingQuestionsService {
  constructor(
    @InjectModel('CodingQuestion')
    private readonly codingQuestionModel: Model<CodingQuestion>,
  ) {}

  createQuestion(codingQuestionDto: CodingQuestionDto) {
    const createdQuestion = new this.codingQuestionModel(codingQuestionDto);
    return createdQuestion.save();
  }

  searchCodingQuestions(
    searchDto: CodingSearchDto,
  ): Promise<CodingQuestionDto[]> {
    const { difficultyLevel, language, tags, title, functionName } = searchDto;

    const query: any = {};

    if (title) {
      query['title'] = { $regex: title, $options: 'i' };
    }
    if (functionName) {
      query['functionName'] = { $regex: functionName };
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

    return this.codingQuestionModel.find(query);
  }

  async questByCompany(id: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      createdBy: new mongoose.Types.ObjectId(id),
    };
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.codingQuestionModel.aggregate([
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
      result = await this.codingQuestionModel.aggregate([
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
    if (questions.lenght === 0) {
      throw new NotFoundException('Company has no codingQuestions');
    }
    return {
      codingQuestions: questions,
      total: totalDocs,
    };
  }

  async getAllQuestions(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.codingQuestionModel.aggregate([
        {
          $facet: {
            questions: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.codingQuestionModel.aggregate([
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
      codingQuestions: questions,
      total: totalDocs,
    };
  }

  async getQuestionById(id: string) {
    const question = await this.codingQuestionModel.findOne({ _id: id }).exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async updateQuestion(
    userId: string,
    id: string,
    updateCodingQuestionDto: UpdateCodingQuestionDto,
  ) {
    const updatedQuestion = await this.codingQuestionModel.findOneAndUpdate(
      {
        _id: id,
        createdBy: userId,
      },
      updateCodingQuestionDto,
      { new: true },
    );

    if (!updatedQuestion) {
      throw new ConflictException('Unauthorized editing or invalid id');
    }
    return updatedQuestion;
  }

  async deleteQuestion(id: string, userid: string) {
    const deletedQuestion = await this.codingQuestionModel.findOneAndDelete({
      createdBy: userid,
      id,
    });
    if (!deletedQuestion) {
      throw new ConflictException('Unauthorized Deletion or invalid id');
    }
    return { message: 'Coding Question deleted' };
  }

  async getTotalLength() {
    return (await this.codingQuestionModel.countDocuments()).toString();
  }

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
      // Find questions that have any of the provided tag
      query['tags'] = { $in: tags };
    }
    // console.log(query);

    const questions = await this.codingQuestionModel.find(query);

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
    // console.log('filtered questions', filteredQuestions);

    return {
      easy: filteredQuestions['easy'] || { id: [], count: 0 },
      medium: filteredQuestions['medium'] || { id: [], count: 0 },
      hard: filteredQuestions['hard'] || { id: [], count: 0 },
    };
  }

  async getQuestionsByLangTagsComp(
    id: string,
    language: string,
    tags: string[],
  ) {
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
      // Find questions that have any of the provided tag
      query['tags'] = { $in: tags };
    }

    const questions = await this.codingQuestionModel.find(query);

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
    // console.log('filtered questions', filteredQuestions);

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
    let questions = await this.codingQuestionModel.collection
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
                  language: 1,
                  difficultyLevel: 1,
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

    return questions;
    // return questionIdsAsStrings;
  }

  async getQuestionsByDiffTagsComp(
    id: string,
    language: string,
    tags: string[],
    size: number[],
  ) {
    let questions = await this.codingQuestionModel.collection
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
                  language: 1,
                  difficultyLevel: 1,
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

    return questions;
    // return questionIdsAsStrings;
  }
}
