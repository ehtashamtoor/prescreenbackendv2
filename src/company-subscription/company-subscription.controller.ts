import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CompanySubscriptionService } from './company-subscription.service';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthReq, ReminderData } from 'src/types';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { scheduleJob } from 'node-schedule';
import * as moment from 'moment';
import { MailingService } from 'src/mailing/mailing.service';
import { getNormalDate } from 'src/utils/funtions';

enum EmailType {
  RenewReminder = 'RenewReminder',
  Expiration = 'Expiration',
}
import { UpdatePlanDto } from './dto/updatePlan.dto';

@ApiTags('Company subscription API')
@Controller('api/company-subscription')
export class CompanySubscriptionController {
  constructor(
    private readonly companySubscriptionService: CompanySubscriptionService,
    private readonly userService: UserService,
    private readonly mailingService: MailingService,
  ) {
    // Runs every day at 12 AM
    scheduleJob('00 00 * * *', async () => {
      try {
        const currentTime = new Date();
        console.log('Running cron subscriptionPlans at', currentTime);

        // Find plans expiring within the next 10 days
        const reminderDate = moment(currentTime).subtract(10, 'days').toDate();
        const plansToRenew =
          await this.companySubscriptionService.findPlansToRenew(reminderDate);

        if (plansToRenew) {
          for (const plan of plansToRenew) {
            // first convert date to normal readable format
            const readableDate = getNormalDate(
              plan.subscriptionEndDate as Date,
            );

            const reminderData = {
              subscriptionPlan: plan.company.name,
              expiryDate: readableDate,
              email: plan.company.email,
            };

            // Send ReminderEmail renew subscription
            // await this.sendReminderEmail(reminderData);
            await this.sendEmail(reminderData, EmailType.RenewReminder);
          }
        }
        const expiredPlans =
          await this.companySubscriptionService.findPlansWithExpiredDeadlines(
            currentTime,
          );

        if (expiredPlans) {
          for (const plans of expiredPlans) {
            await this.companySubscriptionService.closePlans(plans.id);
            // console.log('subscriptionStatus updated:', updatedPlans);

            for (const plan of expiredPlans) {
              const readableDate = getNormalDate(
                plan.subscriptionEndDate as Date,
              );
              const reminderData = {
                subscriptionPlan: plan.company.name,
                expiryDate: readableDate,
                email: plan.company.email,
              };

              // Send subscription ExpirationEmail
              await this.sendEmail(reminderData, EmailType.Expiration);
            }
          }
        }
      } catch (error) {
        console.error(
          'An error occurred during manual cron subscriptionPlans execution:',
          error,
        );
        throw error;
      }
    });
  }

  public async sendEmail(reminderData: ReminderData, emailType: EmailType) {
    try {
      let isEmailSent: boolean;

      switch (emailType) {
        case EmailType.RenewReminder:
          isEmailSent =
            await this.mailingService.sendPlanRenewReminder(reminderData);
          break;
        case EmailType.Expiration:
          isEmailSent =
            await this.mailingService.sendPlanExpiration(reminderData);
          break;
        default:
          throw new Error('Invalid email type');
      }

      if (!isEmailSent) {
        console.log(`${emailType} Email not sent`);
      } else {
        console.log(`${emailType} Email Sent`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('create-subscription')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), CompanyGuard)
  async create(@Body() dto: CreateCompanySubscriptionDto, @Req() req: AuthReq) {
    // set endDate for company subscription plan
    const currentDate = new Date();
    if (dto.planType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
      dto.subscriptionEndDate = currentDate;
    } else if (dto.planType === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      dto.subscriptionEndDate = currentDate;
    } else {
      throw new BadRequestException('Plan type is invalid');
    }

    dto.company = req.user.id;
    dto.subscriptionStartDate = new Date();

    const isCreated = await this.companySubscriptionService.create(dto);
    // console.log(isCreated);

    // now update the id of this subscription in user model
    await this.userService.updateUser(req.user.id, {
      subscriptionPlan: isCreated.id,
    });
    return isCreated;
  }

  @Get('getAll')
  findAll() {
    return this.companySubscriptionService.findAll();
  }

  @Get('getOne/:id')
  findOne(@Param('id') id: string) {
    return this.companySubscriptionService.findOne(id);
  }

  @Patch('update-subscription')
  @ApiBearerAuth()
  @ApiSecurity('JWT-auth')
  @UseGuards(AuthGuard(), CompanyGuard)
  async update(
    // @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @Req() req: AuthReq,
  ) {
    // set endDate for company subscription plan
    const currentDate = new Date();
    if (dto.planType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
      dto.subscriptionEndDate = currentDate;
    } else if (dto.planType === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      dto.subscriptionEndDate = currentDate;
    } else {
      throw new BadRequestException('Plan type is invalid');
    }

    // const subPlan = await this.subPlanService.findById(dto.SubscriptionPlan);

    dto.subscriptionStartDate = new Date();

    const subscriptionFound = await this.companySubscriptionService.find(
      req.user.id,
    );

    if (!subscriptionFound) {
      throw new NotFoundException('No Subscription Found');
    }

    const isUpdated = await this.companySubscriptionService.update(
      subscriptionFound.id,
      dto,
    );

    // now update the id of this subscription in user model
    await this.userService.updateUser(req.user.id, {
      subscriptionPlan: isUpdated.id,
    });

    return isUpdated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companySubscriptionService.remove(id);
  }
}
