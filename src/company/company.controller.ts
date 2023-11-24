import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  adminAnalyticsResponse,
  companyPaginationDto,
  companyResponseDto,
} from 'src/utils/classes';
import { AdminGuard } from 'src/auth/jwt.admin.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Company')
@Controller('/api')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // @Post('/companies')
  // CreateCompany(@Body() companyDto: CompanyDto, hashedPass: string) {
  //   return this.companyService.create(companyDto, hashedPass);
  // }

  @Get('/companies')
  @ApiOperation({
    summary: 'Get all companies or search by companyTitle',
    description:
      'Get all companies or paginate them OR search a company by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the Companies',
    type: companyResponseDto,
  })
  async getAllCompanies(@Query() query: companyPaginationDto) {
    if (query.page !== undefined && query.limit !== undefined) {
      const { page, limit } = query;
      return await this.companyService.findAll(page, limit);
    } else if (query.companyTitle) {
      const { companyTitle } = query;
      return await this.companyService.findAll(
        undefined,
        undefined,
        companyTitle,
      );
    } else {
      return await this.companyService.findAll();
    }
  }

  @Get('adminAnalytics')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), AdminGuard)
  @ApiResponse({
    description: 'Array of  companies counts',
    status: 200,
    type: adminAnalyticsResponse,
  })
  async getJobAnalytics() {
    return await this.companyService.companyAnalytics();
  }

  // @Get('companyProfileForCandidate/:id')
  // @UseGuards(AuthGuard())
  // async companyProfile(@Param('id') id: string) {
  //   return await this.companyService.companyProfile(id);
  // }

  @Get('/companies/:companyId')
  @ApiOperation({ summary: 'Get the company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Company by id',
    type: UpdateCompanyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  getCompanyById(@Param('companyId') companyId: string) {
    return this.companyService.findById(companyId);
  }

  @Get('/companies/profile/:companyId')
  @ApiOperation({ summary: 'Get the company profile by ID' })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  getCompanyProfileById(@Param('companyId') companyId: string) {
    return this.companyService.getCompanyProfileById(companyId);
  }

  @Put('/companies/:userId')
  async updateCompany(
    @Param('userId') userId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(userId, updateCompanyDto);
  }
}
