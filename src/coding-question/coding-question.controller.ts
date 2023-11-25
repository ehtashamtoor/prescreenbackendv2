import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CodingQuestionsService } from './coding-question.service';
import {
  CodingQuestionDto,
  ResponseCodingDto,
} from './dto/create-coding-question.dto';
import { UpdateCodingQuestionDto } from './dto/update-coding-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { paginationDto } from 'src/utils/classes';
import { CodingSearchDto } from './dto/searcCodingQuestion.dto';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';

@ApiTags('Coding Questions')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class CodingQuestionsController {
  constructor(
    private readonly codingQuestionsService: CodingQuestionsService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}
  // TODO: not in use
  @Post('/randomQ')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        language: {
          type: 'string',
        },
        size: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
    },
  })
  getRandomQ(
    @Body()
    dto: {
      tags: string[];
      language: string;
      size: number[];
    },
  ) {
    const { language, tags, size } = dto;
    if (!language) {
      throw new BadRequestException('Language is required');
    }
    return this.codingQuestionsService.getQuestionsByDiffTags(
      language,
      tags,
      size,
    );
  }

  @Post('/coding-questions')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Create a Coding Question' })
  @ApiResponse({
    status: 201,
    description: 'Created Coding Question',
    type: CodingQuestionDto,
  })
  async createQuestion(
    @Body() codingQuestionDto: CodingQuestionDto,
    @Req() req: AuthReq,
  ) {
    const { id } = req.user;
    codingQuestionDto.createdBy = id;

    // Check limit
    // const feature = await this.restrictionsService.checkFeaturesUsed(
    //   id,
    //   'codingQuestion',
    //   [{}],
    //   codingQuestionDto,
    //   {},
    // );

    // const generalCount = getupdateCodingQuestions(codingQuestionDto, feature);
    // console.log('generalCount', generalCount);

    const newQuestion =
      await this.codingQuestionsService.createQuestion(codingQuestionDto);

    // Update Codig-question used
    // await this.restrictionsService.updateFeatures(id, {
    //   featuresUsed: {
    //     codingQuestionUsed: generalCount,
    //   },
    // });

    return newQuestion;
  }
  // TODO: not in usE
  @Get('search-codingQuestions')
  @UseGuards(AuthGuard(), CompanyGuard)
  async search(
    @Query() searchDto: CodingSearchDto,
  ): Promise<CodingQuestionDto[]> {
    return this.codingQuestionsService.searchCodingQuestions(searchDto);
  }

  // @Get('/coding-questions/byCompany')
  // @UseGuards(AuthGuard())
  // @ApiOperation({
  //   summary: 'Get all coding questions of a company or paginate them',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns all Coding Questions of a company',
  //   type: [CodingQuestionDto],
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Coding Questions not found',
  // })
  // questionsByCompany(@Req() req: AuthReq, @Query() query: paginationDto) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.codingQuestionsService.questByCompany(
  //       req.user.id,
  //       page,
  //       limit,
  //     );
  //   } else {
  //     return this.codingQuestionsService.questByCompany(req.user.id);
  //   }
  // }

  @Get('/coding-questions')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({
    summary:
      'Get all coding questions  according to subscriptionPlan or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all Coding Questions',
    type: ResponseCodingDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Questions not found',
  })
  async getAllQuestions(@Req() req: AuthReq, @Query() query: paginationDto) {
    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'codingQuestion',
    );
    if (codingQuestion == true) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.codingQuestionsService.getAllQuestions(page, limit);
      } else {
        return this.codingQuestionsService.getAllQuestions();
      }
    }
    if (codingQuestion == false) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.codingQuestionsService.questByCompany(
          req.user.id,
          page,
          limit,
        );
      } else {
        return this.codingQuestionsService.questByCompany(req.user.id);
      }
    }
  }

  @Get('/coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Get coding question By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a Coding Question',
    type: CodingQuestionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Coding Question not found',
  })
  getQuestionById(@Param('id') id: string) {
    return this.codingQuestionsService.getQuestionById(id);
  }

  @Post('/coding-questionsByDifficulty')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Get coding question By Difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Returns Coding Questions',
    schema: {
      type: 'object',
      properties: {
        easy: {
          type: 'object',
          properties: {
            count: {
              type: 'number',
            },
          },
        },
        medium: {
          type: 'object',
          properties: {
            count: {
              type: 'number',
            },
          },
        },
        hard: {
          type: 'object',
          properties: {
            count: {
              type: 'number',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'questions not found',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        language: {
          type: 'string',
        },
      },
    },
  })
  async getQuestionByDifficulty(
    @Req() req: AuthReq,
    @Body() dto: { tags: string[]; language: string },
  ) {
    // let userid = req.user.id;
    const { language, tags } = dto;

    if (!language) {
      throw new BadRequestException('Language is required');
    }
    // Check permission for codingBank
    const codingQuestion = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'codingQuestion',
    );
    if (codingQuestion == true) {
      return this.codingQuestionsService.getQuestionsByLangTags(language, tags);
    } else if (codingQuestion == false) {
      return this.codingQuestionsService.getQuestionsByLangTagsComp(
        req.user.id,
        language,
        tags,
      );
    }
  }

  @Put('/coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Edits the Coding Question' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Coding Question',
    type: CodingQuestionDto,
  })
  async updateQuestion(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateCodingQuestionDto: UpdateCodingQuestionDto,
  ) {
    return this.codingQuestionsService.updateQuestion(
      req.user.id,
      id,
      updateCodingQuestionDto,
    );
  }

  @Delete('/coding-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Deletes a Coding Question by its id' })
  async deleteQuestion(@Param('id') id: string, @Req() req: AuthReq) {
    return this.codingQuestionsService.deleteQuestion(id, req.user.id);
  }
}
