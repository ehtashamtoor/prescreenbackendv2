import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CandidateApplicationService } from 'src/candidate-application/candidate-application.service';
import { AuthReq, jobReminderData } from 'src/types';
import { scheduleJob } from 'node-schedule';
import {
  JobAnalyticsResponse,
  jobPaginationDto,
  jobsListingDto,
  userAppliesDto,
} from 'src/utils/classes';
import { RejectDto } from 'src/utils/classes';
import { SubPlanRestrictionsService } from 'src/sub-plan-restrictions/sub-plan-restrictions.service';
import { getNormalDate, getupdatedJobsAllowed } from 'src/utils/funtions';
// import { CompanyGuard } from 'src/auth/jwt.company.guard';
import { CandidateGuard } from 'src/auth/jwt.candidate.guard';
import { UserService } from 'src/user/user.service';
import { CandidateService } from 'src/candidate/candidate.service';
import * as moment from 'moment';
import { MailingService } from 'src/mailing/mailing.service';

@ApiTags('Company Job Module')
@ApiBearerAuth()
@ApiSecurity('JWT-auth')
@Controller('api/jobs')
export class JobController {
  constructor(
    private readonly restrictionsService: SubPlanRestrictionsService,
    private candidateApplicationService: CandidateApplicationService,
    private readonly jobService: JobService,
    private readonly userService: UserService,
    private readonly candidateService: CandidateService,
    private readonly mailingService: MailingService,
  ) {
    // Runs every day at 12 AM
    scheduleJob('00 00 * * *', async () => {
      try {
        const currentTime = new Date();
        console.log('Running cron job at', currentTime);

        // Find plans expiring within the next 5, 3, and 1 days
        const reminderDate1 = moment(currentTime).subtract(5, 'days').toDate();
        const reminderDate2 = moment(currentTime).subtract(3, 'days').toDate();
        const reminderDate3 = moment(currentTime).subtract(1, 'days').toDate();

        const reminder1 = await this.jobService.jobReminder(reminderDate1);
        const reminder2 = await this.jobService.jobReminder(reminderDate2);
        const reminder3 = await this.jobService.jobReminder(reminderDate3);

        if (reminder1) {
          for (const job of reminder1) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);

            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };

            // Send ReminderEmail
            await this.sendJobReminderEmail(reminderData);
            // await this.sendJobReminderEmail(reminderData, Reminder.Reminder1);
          }
        }

        if (reminder2) {
          for (const job of reminder2) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);
            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };
            await this.sendJobReminderEmail(reminderData);
          }
        }

        if (reminder3) {
          for (const job of reminder3) {
            const readableDate = getNormalDate(job.applicationDeadline as Date);
            const reminderData = {
              jobTitle: job.title,
              companyName: job.createdBy.name,
              expiryDate: readableDate,
              email: job.createdBy.email,
            };
            await this.sendJobReminderEmail(reminderData);
          }
        }

        const expiredJobs =
          await this.jobService.findJobsWithExpiredDeadlines(currentTime);
        // console.log('Expired jobs:', expiredJobs);

        for (const job of expiredJobs) {
          await this.jobService.closeJob(job.id);
          // console.log('Job status updated:', updatedJob);
        }
      } catch (error) {
        console.error(
          'An error occurred during manual cron job execution:',
          error,
        );
        throw error;
      }
    });
  }

  public async sendJobReminderEmail(reminderData: jobReminderData) {
    try {
      const isEmailSent =
        await this.mailingService.sendJobReminder(reminderData);
      if (!isEmailSent) {
        console.log('JobReminderEmail not sent');
      } else {
        console.log('JobReminderEmail Sent');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('create-job')
  @UseGuards(AuthGuard())
  async create(@Body() dto: CreateJobDto, @Req() req: AuthReq) {
    dto.createdBy = req.user.id;
    dto.jobStatus = 'open';

    // Check limit
    const feature = await this.restrictionsService.checkFeaturesUsed(
      req.user.id,
      'jobs',
      {},
      dto,
    );

    const generalCount = getupdatedJobsAllowed(dto, feature);
    const newJob = await this.jobService.create(dto);

    // Update jobs used
    await this.restrictionsService.updateFeatures(req.user.id, {
      featuresUsed: { jobsUsed: generalCount },
    });

    return newJob;
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all jobs of all companies or paginate them',
    description: 'Returns all jobs of all companies',
  })
  @UseGuards(AuthGuard())
  async findAllJobs(@Query() query: jobsListingDto) {
    if (query.page && query.limit) {
      // const { page, limit } = query;
      return await this.jobService.findAllJobs(query);
    } else {
      // console.log('going to find all jobs');
      return await this.jobService.findAllJobs(query);
    }
  }

  @Get('allByCompany')
  @ApiOperation({
    summary: 'Get all jobs of a company',
    description:
      'Get all jobs of a company, or get based on jobStatus, jobStatus and pagination',
  })
  // @UseGuards(AuthGuard(), CompanyGuard)
  @UseGuards(AuthGuard())
  findAllJobsByCompany(@Req() req: AuthReq, @Query() query: jobPaginationDto) {
    const userid = req.user.id;
    if (query.jobStatus) {
      const { jobStatus } = query;
      if (query.page && query.limit) {
        const { page, limit } = query;
        return this.jobService.findAllByCompany(userid, jobStatus, page, limit);
      } else {
        return this.jobService.findAllByCompany(userid, jobStatus);
      }
    } else {
      return this.jobService.findAllByCompany(userid);
    }
  }

  @Get('analytics/jobStatus')
  @UseGuards(AuthGuard())
  @ApiResponse({
    description: 'Array of  jobStatus counts',
    status: 200,
    type: JobAnalyticsResponse,
  })
  async getJobAnalytics(@Req() req: AuthReq) {
    return await this.jobService.getJobAna(req.user.id);
  }

  @Get('analytics/:statusField')
  @ApiResponse({
    description: 'Details of jobs based on statusField of job',
    status: 200,
    type: JobAnalyticsResponse,
  })
  @UseGuards(AuthGuard())
  async getJobAnalyticsDetail(
    @Req() req: AuthReq,
    @Param('statusField') statusField: string,
  ) {
    return await this.jobService.getJobDetailsByStatus(
      req.user.id,
      statusField,
    );
  }

  // // @Get('jobsByCompany/:id')
  // @Get('companyProfile/:id')
  // @ApiOperation({
  //   summary: 'Get company profile and its jobs or paginate them',
  //   description: 'Returns all jobs of a company and company profile',
  // })
  // @UseGuards(AuthGuard())
  // find(@Param('id') id: string, @Query() query: paginationDto) {
  //   if (query.page && query.limit) {
  //     const { page, limit } = query;
  //     return this.jobService.findByCompany(id, page, limit);
  //   } else {
  //     return this.jobService.findByCompany(id);
  //   }
  // }

  @Get(':id')
  // @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update job by id',
  })
  // @UseGuards(AuthGuard(), CompanyGuard)
  @UseGuards(AuthGuard())
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobService.update(id, dto);
  }

  @Patch('applications/reject')
  @UseGuards(AuthGuard())
  rejectApplication(@Body() dto: RejectDto) {
    return this.jobService.rejectApplication(dto);
  }

  @Post('applications/:jobid/RandomUserApplyJob')
  async makeUserApply(
    @Body() dto: userAppliesDto,
    @Param('jobid') jobid: string,
  ) {
    // console.log('user given info for apply.....', dto);

    const { email } = dto;
    dto.isSocialLogin = false;
    dto.userType = 'candidate';
    // first check if we have email in user documents
    const isUserPresent = await this.userService.findByEmail(email);
    // console.log(isUserPresent.user, 'user');
    if (isUserPresent.user) {
      // now check for password, if password is there then it means that user is our registered user
      const isRegisteredUser =
        isUserPresent.user?.password != '' ? true : false;

      console.log('is registered user or not...', isRegisteredUser);

      if (isRegisteredUser === true) {
        // first check if he already applied for this job
        // find application based on userid and jobid
        const applicationFound =
          await this.candidateApplicationService.findByUserEmail(
            jobid,
            isUserPresent.user?.id,
          );
        console.log('applicationFound<', applicationFound);
        if (applicationFound.success == true && applicationFound.application) {
          throw new BadRequestException(
            'It looks like you have already applied for this job',
          );
        } else if (applicationFound.success == false) {
          const applicationCreated =
            await this.candidateApplicationService.create(
              isUserPresent.user?.id,
              jobid,
            );
          console.log('Registered User: created application.');

          await this.jobService.updateApplicants(
            applicationCreated.application.id,
            jobid,
          );
          return applicationCreated;
        }
        // create the candidate application to apply for job
      } else if (isRegisteredUser == false) {
        console.log(
          'user is there but no password, mean no registered user still...',
          isRegisteredUser,
        );
        // first check if he already applied for this job
        // find application based on userid and jobid
        const applicationFound =
          await this.candidateApplicationService.findByUserEmail(
            jobid,
            isUserPresent.user?.id,
          );
        if (applicationFound.success == true && applicationFound.application) {
          console.log('if apply for job');
          throw new BadRequestException(
            'It looks like you have already applied for this job!!.....',
          );
        } else {
          console.log('if not apply for job');
          // means that we have a user but he is not registered yet
          // update the user model, candidate model and make a candidate application for this job
          // now update user model
          const userUpdated = await this.userService.updateUser(
            isUserPresent.user?.id,
            dto,
          );

          // now update candidate dto
          // console.log(isUserPresent.user.candidate.id);
          const candidateUpdated = await this.candidateService.update(
            isUserPresent.user?.candidate?._id?.toHexString(),
            dto,
          );

          // now create another application of user
          const applicationCreated =
            await this.candidateApplicationService.create(
              isUserPresent.user?.id,
              jobid,
            );

          const updateApplicants = await this.jobService.updateApplicants(
            applicationCreated.application.id,
            jobid,
          );

          return applicationCreated;
        }
      }
    } else {
      // if all checks have failed then it means we have a new random user
      // now create candidate model, user model and make a candidate application for user
      // create candidate model
      const candidateCreated =
        await this.candidateService.createRandomCandidate(dto);

      const { id } = candidateCreated;
      dto.candidate = id;
      dto.password = '';
      // create user model with candidate id
      const userCreated = await this.userService.createRandomUser(dto);

      const userId = userCreated.id;
      candidateCreated.createdBy = userId;
      await candidateCreated.save();

      // now create the candidate application(jobid, candidateid)
      const applicationCreated = await this.candidateApplicationService.create(
        userId,
        jobid,
      );

      const applicationId = applicationCreated.application.id;
      // console.log('application id:... ', applicationId, '  jobid ', jobid);
      const updateApplicants = await this.jobService.updateApplicants(
        applicationId,
        jobid,
      );

      return applicationCreated;
    }
  }

  @Patch('applications/alreadyApplied/:jobid')
  @UseGuards(AuthGuard())
  async checkAlreadyApplied(
    @Param('jobid') jobid: string,
    @Req() req: AuthReq,
  ) {
    const jobFound = await this.jobService.findOne(jobid);

    if (jobFound.jobStatus == 'closed') {
      throw new BadRequestException('This job is closed');
    }

    const userId = req.user.id;

    // find application based on userid and jobid
    const applicationFound =
      await this.candidateApplicationService.findByUserEmail(jobid, userId);

    // check if user has already applied
    // const isApplied = jobFound.applications.some((appId) => {
    //   const dbId = appId?.id.toString();
    //   // return applicationFound.id === dbId;
    // });

    // console.log('.........', applicationFound);

    if (applicationFound.application) {
      throw new BadRequestException(
        'It looks like you have already applied for this job!',
      );
    }
    return true;
  }

  @Patch('applications/:job')
  @UseGuards(AuthGuard(), CandidateGuard)
  @UseGuards(AuthGuard())
  async updateApplicants(@Req() req: AuthReq, @Param('job') job: string) {
    const jobFound = await this.jobService.findOne(job);

    if (jobFound.jobStatus == 'closed') {
      throw new BadRequestException('This job is closed');
    }
    // console.log('jobFound', jobFound);
    const userId = req.user.id;

    // check if user has already applied
    // find application based on userid
    // const applicationFound =
    //   await this.candidateApplicationService.findByUserEmail(job, userId);

    // const isApplied = jobFound.applications.some((appId) => {
    //   const dbId = appId?.id.toString();
    //   return applicationFound.id === dbId;
    // });
    // if (isApplied) {
    //   throw new BadRequestException(
    //     'It looks like you have already applied for this job',
    //   );
    // }
    // create Application only if job is open
    // call service of create-application
    const Application = await this.candidateApplicationService.create(
      userId,
      job,
    );

    const applicationId = Application.application.id;
    const updateApplicants = this.jobService.updateApplicants(
      applicationId,
      job,
    );
    return updateApplicants;
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}
