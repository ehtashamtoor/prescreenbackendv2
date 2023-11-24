import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CandidateObj, paginationDto } from 'src/utils/classes';
import { AuthGuard } from '@nestjs/passport';
import { Qualifications } from './dto/updatecandidate.dto';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';

@ApiTags('Candidates')
@Controller('/api')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('candidates')
  @ApiOperation({
    summary: 'Get all candidates or paginate them',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Candidates',
    type: [CandidateObj],
  })
  @UseGuards(AuthGuard())
  getAllCandidates(@Query() query: paginationDto) {
    if (query.page && query.limit) {
      const { page, limit } = query;
      return this.candidateService.findAll(page, limit);
    } else {
      return this.candidateService.findAll();
    }
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns Candidate by id',
    type: CandidateObj,
  })
  @ApiResponse({
    status: 404,
    description: 'Candidate not found',
  })
  @UseGuards(AuthGuard())
  getCandidateById(@Param('id') id: string) {
    return this.candidateService.findById(id);
  }

  @Get('candidates/profile/:candId')
  @ApiOperation({ summary: 'Get the candidate profile by ID' })
  @ApiResponse({
    status: 404,
    description: 'Candidate not found',
  })
  getCompanyProfileById(@Param('candId') candId: string) {
    return this.candidateService.getCandProfileById(candId);
  }

  @Put('candidates/:id')
  @ApiOperation({ summary: 'Update candidate by ID' })
  @UseGuards(AuthGuard(), CandidateGuard)
  updateCandidate(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.updateCandidate(id, updateCandidateDto);
  }

  @Put('profile/:candId/:itemId')
  @ApiOperation({
    summary: 'Update skill, eduationDetails and experiences of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async updateCandidateItem(
    @Param('candId') candId: string,
    @Param('itemId') itemId: string,
    @Body() updateData: Qualifications,
  ) {
    return this.candidateService.updateField(candId, itemId, updateData);
  }

  @Delete('candidate/:fieldType/:candId/:itemId')
  @ApiOperation({
    summary: 'Delete skill, eduationDetails and experiences of candidate',
  })
  @UseGuards(AuthGuard(), CandidateGuard)
  async delete(
    @Param('candId') candId: string,
    @Param('itemId') itemId: string,
    @Param('fieldType') fieldType: string,
  ) {
    return this.candidateService.remove(candId, itemId, fieldType);
  }

  // @Get('profile/:Id/:type')
  // @ApiOperation({
  //   summary:
  //     "Get the candidate's skill, education or experience object by object ID",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description:
  //     "Returns the candidate's skill, education or experience object",
  // })
  // getSkillById(@Param('Id') Id: string, @Param('type') type: string) {
  //   return this.candidateService.findSkillById(Id, type);
  // }

  // @Delete('/candidates/:id')
  // async deleteCandidate(@Param('id') id: string) {
  //   await this.candidateService.remove(id);
  //   return { message: 'Candidate deleted successfully' };
  // }
}
