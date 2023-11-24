import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Admin Subscription API')
@Controller('api/subscription-plan')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post('createPlan')
  // TODO add adminguard
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Creates a Subscription plan' })
  @ApiResponse({
    status: 201,
    description: 'Subscription plan Created',
    // type: CreateSubscriptionPlanDto,
  })
  create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(dto);
  }

  @Get('/allPlans')
  @UseGuards(AuthGuard())
  @ApiOperation({
    description: 'Get all Plans',
  })
  @ApiResponse({
    status: 200,
  })
  findAll() {
    return this.subscriptionPlanService.findAll();
  }
  @Get('/allActivePlans')
  // @UseGuards(AuthGuard())
  @ApiOperation({
    description: 'Get all active Plans',
  })
  @ApiResponse({
    status: 200,
  })
  findActivePlans() {
    return this.subscriptionPlanService.findActivePlans();
  }

  @Get('plan/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get Plan By ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a Plan',
  })
  findById(@Param('id') id: string) {
    return this.subscriptionPlanService.findById(id);
  }

  @Put('plan/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Edits the Plan' })
  @ApiResponse({
    status: 200,
    description: 'Returns an edited Plan',
  })
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlanService.update(id, dto);
  }
  @Patch('plan/:id/:action')
  @UseGuards(AuthGuard())
  @ApiParam({
    description: 'activate or deactivate',
    name: 'action',
  })
  @ApiOperation({ summary: 'Activates/deactivates the plan' })
  updateStatus(@Param('id') id: string, @Param('action') action: string) {
    if (action !== 'deactivate' && action !== 'activate') {
      throw new BadRequestException(`Invalid Action ${action}`);
    }
    return this.subscriptionPlanService.updateStatus(id, action);
  }

  // @Delete('plan/:id')
  // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: 'Delete a Plan by its id' })
  // remove(@Param('id') id: string) {
  //   return this.subscriptionPlanService.remove(id);
  // }
}
