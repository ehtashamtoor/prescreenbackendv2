import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Req,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { McqService } from 'src/mcq/mcq.service';
import { CodingQuestionsService } from 'src/coding-question/coding-question.service';
import { ExamDto, ResponsePagination } from './dto/exam.dto';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { paginationDto } from 'src/utils/classes';

@ApiTags('Exam')
@Controller('/api')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class ExamController {
  constructor(
    private readonly examService: ExamService,
    private readonly mcqService: McqService,
    private readonly questionService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}

  @Post('/create-exam')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Creates an Exam' })
  @ApiResponse({
    status: 201,
    description: 'Created Exam',
    type: CreateExamDto,
  })
  async create(@Body() dto: CreateExamDto, @Req() req: AuthReq) {
    const { id } = req.user;
    const { language, tags } = dto;

    // const Questions: any = await this.questionService.getQuestionsByLangTags(
    //   language,
    //   tags,
    // );
    // const MCQs: any = await this.mcqService.getQuestionsByLangTags(
    //   language,
    //   tags,
    // );

    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      id,
      'codingQuestion',
    );
    if (codingQuestion == true) {
      const Questions: any = await this.questionService.getQuestionsByLangTags(
        language,
        tags,
      );
      // check if coding questions are in range as asked by user
      if (
        Questions.easy.count < dto.codingDifficultyComposition.easy ||
        Questions.medium.count < dto.codingDifficultyComposition.medium ||
        Questions.hard.count < dto.codingDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    } else if (codingQuestion == false) {
      const Questions = await this.questionService.getQuestionsByLangTagsComp(
        req.user.id,
        language,
        tags,
      );
      // console.log('Questions', Questions);
      if (
        Questions.easy.count < dto.codingDifficultyComposition.easy ||
        Questions.medium.count < dto.codingDifficultyComposition.medium ||
        Questions.hard.count < dto.codingDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough Coding questions available in one or more difficulty levels',
        );
      }
    }

    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      id,
      'mcqs',
    );
    if (mcqs == true) {
      const MCQs: any = await this.mcqService.getQuestionsByLangTags(
        language,
        tags,
      );
      // check if mcqs are in range as asked by user
      if (
        MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
        MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
        MCQs.hard.count < dto.mcqDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    } else if (mcqs == false) {
      const MCQs: any = await this.mcqService.getMcqsByLangTagsComp(
        req.user.id,
        language,
        tags,
      );
      if (
        MCQs.easy.count < dto.mcqDifficultyComposition.easy ||
        MCQs.medium.count < dto.mcqDifficultyComposition.medium ||
        MCQs.hard.count < dto.mcqDifficultyComposition.hard
      ) {
        throw new BadRequestException(
          'Not enough MCQ questions available in one or more difficulty levels.',
        );
      }
    }

    try {
      dto.createdBy = id;
      const createdExam = await this.examService.create(dto);
      return createdExam;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.title === 1) {
        throw new BadRequestException(
          'Title already exists. Choose a unique title.',
        );
      }
      throw error;
    }
  }

  @Get('/exams')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({
    description:
      'Get all Exams according to subscription plan or paginate them',
  })
  @ApiResponse({
    status: 200,
    type: ResponsePagination,
  })
  async findAll(@Req() req: AuthReq, @Query() query: paginationDto) {
    //  Check Permission for examBank
    const exams = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'exams',
    );
    console.log('exams allowed or not', exams);
    if (exams == true) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.examService.findAll(page, limit);
      } else {
        return this.examService.findAll();
      }
    } else if (exams == false) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.examService.findByCompany(req.user.id, page, limit);
      } else {
        return this.examService.findByCompany(req.user.id);
      }
    }
  }

  // @Get('exams/byCompany')
  // @UseGuards(AuthGuard())
  // @ApiOperation({
  //   summary: 'Get all Exams of a particular company or paginate them',
  // })
  // @ApiResponse({
  //   status: 200,
  //   type: [ExamDto],
  // })
  // findExamsByCompany(@Req() req: AuthReq, @Query() query: paginationDto) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.examService.findByCompany(req.user.id, page, limit);
  //   } else {
  //     return this.examService.findByCompany(req.user.id);
  //   }
  // }

  @Get('exams/:examId')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get Exam By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns an Exam',
    type: ExamDto,
  })
  findOne(@Param('examId') id: string) {
    return this.examService.findOne(id);
  }

  // @Get('exams/candidate/:id')
  // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: 'Get Exam By ID by candidate' })
  // @ApiExtraModels(ExamCodingQuestion, ExamMcqQuestion)
  // @ApiOkResponse({
  //   schema: { anyOf: refs(ExamCodingQuestion, ExamMcqQuestion) },
  // })
  // findExam(@Param('id') id: string) {
  //   // const userId = req.user.id;
  //   return this.examService.findExam(id);
  // }

  @Put('exams/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Edits the Exam' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Exam',
    type: ExamDto,
  })
  update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examService.update(id, req.user.id, updateExamDto);
  }

  @Delete('exams/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Deletes an Exam by its id' })
  remove(@Param('id') id: string, @Req() req: AuthReq) {
    return this.examService.remove(id, req.user.id);
  }
}
