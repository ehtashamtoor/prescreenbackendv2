import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { AuthReq } from 'src/types';
import { CreateDto, paginationDto } from 'src/utils/classes';
import { CandidateApplicationService } from './candidate-application.service';
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto';
import { CompanyGuard } from 'src/auth/jwt.company.guard';

@ApiTags('Candidate Application')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/candidate-application')
export class CandidateApplicationController {
  constructor(
    private readonly candidateApplicationService: CandidateApplicationService,
  ) {}

  @Post('create-application')
  @UseGuards(AuthGuard(), CandidateGuard)
  create(@Req() req: AuthReq, @Body() dto: CreateDto) {
    const userId = req.user.id;
    return this.candidateApplicationService.create(userId, dto.job);
  }

  @Get('allApplications')
  @ApiOperation({
    summary: 'Get all jobs applications of all companies or paginate them',
    description: 'Returns all jobs applications of all companies',
  })
  @UseGuards(AuthGuard(), CompanyGuard)
  findAll(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      // console.log(query);
      return this.candidateApplicationService.findAll(page, limit);
    } else {
      return this.candidateApplicationService.findAll();
    }
  }

  @Get('analytics/StatusesByCandidate/:jobId')
  @ApiOkResponse({
    description: 'Array of application statusByCandidate counts',
    isArray: true,
  })
  async getStatusByCandidate(@Param('jobId') jobId: string) {
    const candidateApplicationAnalytics =
      await this.candidateApplicationService.getStatusByCandidate(jobId);
    return candidateApplicationAnalytics;
  }

  @Get('ByApplication/:id')
  @ApiOperation({
    summary: 'Get all job-applications by application Id',
  })
  @UseGuards(AuthGuard(), CompanyGuard)
  findOne(@Param('id') id: string) {
    return this.candidateApplicationService.findOne(id);
  }
  @Get('candidateApplicationCandidateStatus')
  @UseGuards(AuthGuard())
  applicationStats(@Req() req: AuthReq) {
    return this.candidateApplicationService.getCandidateStatusCounts(
      req.user.id,
    );
  }
  @Get('candidateApplicationCompanyStatus')
  @UseGuards(AuthGuard(), CompanyGuard)
  applicationCompanyStats(@Req() req: AuthReq) {
    return this.candidateApplicationService.getCompanyStatusCounts(req.user.id);
  }

  @Get('ByCandidate')
  @ApiOperation({
    summary: 'Get all job-applications of a particular candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  findByCandidate(@Req() req: AuthReq, @Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateApplicationService.findByCandidate(
        req.user.id,
        page,
        limit,
      );
    } else {
      return this.candidateApplicationService.findByCandidate(req.user.id);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), CandidateGuard)
  update(
    @Param('id') id: string,
    @Body() updateCandidateApplicationDto: UpdateCandidateApplicationDto,
  ) {
    return this.candidateApplicationService.update(
      id,
      updateCandidateApplicationDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), CompanyGuard)
  remove(@Param('id') id: string) {
    return this.candidateApplicationService.remove(id);
  }
}
