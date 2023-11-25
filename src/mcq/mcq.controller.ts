import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Put,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { McqService } from './mcq.service';
import {
  CreateMCQDto,
  CreateMcqDtoArray,
  ResponseMCQDto,
} from './dto/create-mcq.dto';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { paginationDto } from 'src/utils/classes';
import { MCQSearchDto } from './dto/searchMcq.dto';
import { MCQ } from './entities/mcq.entity';
import { AuthReq } from 'src/types';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';

@ApiTags('MCQ API')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('/api')
export class McqController {
  constructor(
    private readonly mcqService: McqService,
    private readonly restrictionsService: SubPlanRestrictionsService,
  ) {}
  // FIXME: Not in use
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

    return this.mcqService.getQuestionsByDiffTags(language, tags, size);
  }
  // TODO: subscription plan checks when in use
  @Get('search-mcqs')
  @UseGuards(AuthGuard(), CompanyGuard)
  async search(@Query() searchDto: MCQSearchDto): Promise<MCQ[]> {
    return this.mcqService.searchMCQs(searchDto);
  }

  @Post('/create-mcqs')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({
    summary: 'Create MCQS',
    description: 'Provide array of MCQs',
  })
  @ApiResponse({
    status: 201,
    description: 'Mcqs Created Successfully',
  })
  // TODO if subplan is free restrict private tag
  async create(@Body() mcqArray: CreateMcqDtoArray, @Req() req: AuthReq) {
    const { id } = req.user;
    const { mcqs } = mcqArray;

    // adding CREATED_BY field in each mcq DOCUMENT
    const mcqDocs = mcqs.map((mcq) => ({
      ...mcq,
      createdBy: id,
    }));
    // mcqsDoc frontend mcqs

    //Check limit
    // const feature = await this.restrictionsService.checkFeaturesUsed(
    //   id,
    //   'mcqs',
    //   mcqDocs,
    //   {},
    //   {},
    // );

    // const generalCount = getupdateQuestions(mcqDocs, feature);
    // console.log('generalCount:', generalCount);

    const newMCQ = await this.mcqService.createMCQ(mcqDocs);
    // Update MCQs used
    // await this.restrictionsService.updateFeatures(id, {
    //   featuresUsed: {
    //     mcqUsed: generalCount,
    //   },
    // });

    return newMCQ;
  }

  @Get('/mcq-questions')
  @ApiOperation({
    summary: 'Get all MCQS of company or paginate them',
    description: 'Returns all mcqs of a company',
  })
  @ApiResponse({
    status: 200,
    type: ResponseMCQDto,
  })
  @UseGuards(AuthGuard(), CompanyGuard)
  async findAll(@Req() req: AuthReq, @Query() query: paginationDto) {
    // Check permission for mcqsBank
    // console.log(req.user);
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'mcqs',
    );
    if (mcqs == true) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.mcqService.getAllMCQ(page, limit);
      } else {
        return this.mcqService.getAllMCQ();
      }
    }
    if (mcqs == false) {
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.mcqService.getByCompany(req.user.id, page, limit);
      } else {
        return this.mcqService.getByCompany(req.user.id);
      }
    }
  }

  // @Get('/mcq-questions/byCompany')
  // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: 'Get mcq-questions by company or paginate them' })
  // @ApiResponse({
  //   status: 200,
  //   type: CreateMCQDto,
  // })
  // async find(@Req() req: AuthReq, @Query() query: paginationDto) {
  //   console.log(req.user.id);
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.mcqService.getByCompany(req.user.id, page, limit);
  //   } else {
  //     return this.mcqService.getByCompany(req.user.id);
  //   }
  // }

  @Get('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiResponse({
    status: 200,
    type: CreateMCQDto,
  })
  async findOne(@Param('id') id: string) {
    return this.mcqService.getById(id);
  }

  // FIXME: not in use
  @Post('/mcq-questionsByDifficulty')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiOperation({ summary: 'Get Mcqs By Difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Returns MCQS',
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
    description: 'MCQS not found',
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
    const { language, tags } = dto;
    if (!language) {
      throw new BadRequestException('Language is required');
    }
    // Check permission for mcqsBank
    const mcqs = await this.restrictionsService.checkFeaturesAllowed(
      req.user.id,
      'mcqs',
    );

    if (mcqs == true) {
      return this.mcqService.getQuestionsByLangTags(language, tags);
    } else if (mcqs == false) {
    }
    return this.mcqService.getMcqsByLangTagsComp(req.user.id, language, tags);
  }

  @Put('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  @ApiResponse({
    status: 200,
    type: CreateMCQDto,
  })
  update(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() updateMcqDto: UpdateMcqDto,
  ) {
    return this.mcqService.updateMCQ(req.user.id, id, updateMcqDto);
  }

  @Delete('/mcq-questions/:id')
  @UseGuards(AuthGuard(), CompanyGuard)
  async remove(@Param('id') id: string, @Req() req: AuthReq) {
    return this.mcqService.deleteMCQ(id, req.user.id);
  }
}
