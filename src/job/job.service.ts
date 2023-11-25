import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Job } from './entities/job.entity';
import { EnumsCandidate, RejectDto, jobsListingDto } from 'src/utils/classes';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';

@Injectable()
export class JobService {
  handle() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(CandidateApplication.name)
    private applicationModel: Model<CandidateApplication>,
  ) {}
  // TODO modify job title check with jobType
  async create(dto: CreateJobDto) {
    const jobFound = await this.jobModel.findOne({
      createdBy: dto.createdBy,
      title: {
        $regex: new RegExp(`^${dto.title}$`, 'i'),
      },
    });

    if (jobFound) {
      throw new BadRequestException('This Job is already present');
    }

    const currentTime = new Date();
    const deadline = dto.applicationDeadline;

    if (deadline < currentTime) {
      throw new BadRequestException(
        'Application deadline cannot be equal to and less than current date.',
      );
    }

    const job = await this.jobModel.create(dto);
    return job;
  }

  async jobReminder(reminderDate: Date) {
    const jobs = await this.jobModel
      .find({
        applicationDeadline: { $gte: reminderDate },
      })
      .populate({ path: 'createdBy' });
    return jobs;
  }

  async findJobsWithExpiredDeadlines(currentTime: Date) {
    return this.jobModel.find({ applicationDeadline: { $lt: currentTime } });
  }

  async closeJob(jobId: string) {
    return this.jobModel.findByIdAndUpdate(
      jobId,
      { jobStatus: 'closed' },
      { new: true },
    );
  }

  async findAllByCompany(
    userid: string,
    jobStatus?: string,
    page?: number,
    limit?: number,
  ) {
    let result;
    let matchStage: any = { createdBy: new mongoose.Types.ObjectId(userid) };

    const lookup1 = {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByInfo',
        pipeline: [{ $project: { company: 1 } }],
      },
    };
    const nestedLookup = {
      $lookup: {
        from: 'companies',
        localField: 'createdByInfo.company',
        foreignField: '_id',
        as: 'companyInfo',
        pipeline: [{ $project: { name: 1, email: 2, industry: 3 } }],
      },
    };
    const lookup2 = {
      $lookup: {
        from: 'candidateapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applicationsInfo',
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.jobModel.aggregate([
        {
          $facet: {
            jobs: [
              { $match: matchStage },
              lookup1,
              nestedLookup,
              lookup2,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);

      if (jobStatus) {
        matchStage = {
          createdBy: new mongoose.Types.ObjectId(userid),
          jobStatus: jobStatus,
        };
        result = await this.jobModel.aggregate([
          {
            $facet: {
              jobs: [
                { $match: matchStage },
                lookup1,
                nestedLookup,
                lookup2,
                { $skip: skip },
                { $limit: +limit },
              ],
              totalDocs: [{ $match: matchStage }, { $count: 'count' }],
            },
          },
        ]);
      }
    } else if (jobStatus) {
      matchStage = {
        createdBy: new mongoose.Types.ObjectId(userid),
        jobStatus: jobStatus,
      };
      result = await this.jobModel.aggregate([
        {
          $facet: {
            jobs: [{ $match: matchStage }, lookup1, nestedLookup, lookup2],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.jobModel.aggregate([
        {
          $facet: {
            jobs: [{ $match: matchStage }, lookup1, nestedLookup, lookup2],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const jobs = result[0].jobs;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      jobs: jobs,
      total: totalDocs,
    };
  }

  async findAllJobs(query: jobsListingDto) {
    const dynamicQuery: any = {};

    // query job by title
    if (query.jobTitle) {
      dynamicQuery.title = { $regex: new RegExp(query.jobTitle, 'i') };
    }

    // if (query.companyName) {
    //   dynamicQuery['createdBy.company.name'] = {
    //     $regex: new RegExp(query.companyName, 'i'),
    //   };
    // }

    // query job by employmentType
    if (query.employmentType) {
      dynamicQuery.employmentType = query.employmentType;
    }

    // query jobs by datePosted
    if (query.datePosted) {
      const numericValue = parseInt(query.datePosted);

      if (query.datePosted.toLowerCase().includes('days')) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - numericValue);

        dynamicQuery.createdAt = { $gte: daysAgo };
      } else if (query.datePosted.toLowerCase().includes('hours')) {
        const hoursAgo = new Date();
        hoursAgo.setHours(hoursAgo.getHours() - numericValue);

        dynamicQuery.createdAt = { $gte: hoursAgo };
      } else {
        throw new BadRequestException(
          'Invalid format for datePosted, can be like 14 days or 24 hours',
        );
      }
    }

    // query job by jobStatus
    if (query.jobStatus) {
      dynamicQuery.jobStatus = query.jobStatus;
    }

    // console.log('final query', dynamicQuery);

    let jobs;
    if (query.page && query.limit) {
      let skip = (query.page - 1) * query.limit;
      // Ensure skip is at least 0
      if (skip < 0) {
        skip = 0;
      }
      jobs = await this.jobModel
        .find(dynamicQuery)
        .skip(skip)
        .limit(query.limit)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' });
    } else {
      // console.log('getting all jobs inside');
      jobs = await this.jobModel
        .find(dynamicQuery)
        .populate({
          path: 'createdBy',
          select: 'company',
          populate: { path: 'company', select: 'name email industry' },
        })
        .populate({ path: 'applications' });
    }

    // Filter documents based on companyName
    if (query.companyName) {
      // console.log('query by company name also', query.companyName);
      jobs = jobs.filter(
        (job) =>
          job.createdBy?.company?.name.match(
            new RegExp(query.companyName!, 'i'),
          ),
      );
    }

    const totalDocs = await this.jobModel.find().countDocuments();

    return { jobs, total: totalDocs };
  }

  async findById(id: string) {
    return await this.jobModel.findById(id);
  }

  async getJobAna(userId: string) {
    const jobAnalytics = (await this.jobModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $facet: {
          jobStatusCounts: [
            {
              $group: {
                _id: '$jobStatus',
                count: { $sum: 1 },
              },
            },
          ],
          jobTypeCounts: [
            {
              $group: {
                _id: '$jobType',
                count: { $sum: 1 },
              },
            },
          ],
          employmentTypeCounts: [
            {
              $group: {
                _id: '$employmentType',
                count: { $sum: 1 },
              },
            },
          ],
          jobsTotalCounts: [
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: '$jobStatusCounts',
      },
      {
        $unwind: '$jobTypeCounts',
      },
      {
        $unwind: '$employmentTypeCounts',
      },
      {
        $group: {
          _id: null,
          jobStatusCounts: {
            $push: {
              k: '$jobStatusCounts._id',
              v: '$jobStatusCounts.count',
            },
          },
          jobTypeCounts: {
            $push: {
              k: '$jobTypeCounts._id',
              v: '$jobTypeCounts.count',
            },
          },
          employmentTypeCounts: {
            $push: {
              k: '$employmentTypeCounts._id',
              v: '$employmentTypeCounts.count',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              { $arrayToObject: '$jobStatusCounts' },
              { $arrayToObject: '$jobTypeCounts' },
              { $arrayToObject: '$employmentTypeCounts' },
            ],
          },
        },
      },
    ])) as any;

    // console.log(jobAnalytics);

    return jobAnalytics.length > 0 ? jobAnalytics.pop() : {};
  }

  async getJobDetailsByStatus(userId: string, statusField: string) {
    const validStatusFields = [
      'fullTime',
      'partTime',
      'selfEmployed',
      'freelance',
      'contract',
      'internship',
      'apprenticeship',
      'seasonal',
      'onsite',
      'remote',
      'hybrid',
      'open',
      'closed',
    ];

    if (!validStatusFields.includes(statusField)) {
      throw new BadRequestException('Invalid status field');
    }

    const matchQuery: any = {
      createdBy: new mongoose.Types.ObjectId(userId),
    };

    // Check if the statusField belongs to employmentType, jobType, or jobStatus
    if (
      [
        'fullTime',
        'partTime',
        'selfEmployed',
        'freelance',
        'contract',
        'internship',
        'apprenticeship',
        'seasonal',
      ].includes(statusField)
    ) {
      matchQuery.employmentType = statusField;
    } else if (['onsite', 'remote', 'hybrid'].includes(statusField)) {
      matchQuery.jobType = statusField;
    } else {
      matchQuery.jobStatus = statusField;
    }

    const jobDetails = await this.jobModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          content: 1,
          location: 1,
          salaryRange: 1,
          employmentType: 1,
          jobType: 1,
          jobStatus: 1,
          applicationDeadline: 1,
          applications: 1,
          exam: 1,
          createdBy: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
    ]);

    const totalDocs = jobDetails.length;

    const result: any = {};
    result[statusField] = jobDetails;
    result.totalDocs = totalDocs;

    return result;
  }

  async findOne(jobId: string) {
    const jobFound = await this.jobModel
      .findById(jobId)
      .populate({
        path: 'createdBy',
        select: 'company',
        populate: { path: 'company', select: 'name email industry' },
      })
      .populate({
        path: 'applications',
        populate: { path: 'candidate', select: 'email candidate' },
      });

    if (!jobFound) {
      throw new NotFoundException('Job not found');
    }
    // add a check if jobStatus == closed throw error
    return jobFound;
  }

  async update(jobId: string, dto: UpdateJobDto) {
    const updatedJob = await this.jobModel.findByIdAndUpdate(jobId, dto, {
      new: true,
    });

    if (!updatedJob) {
      throw new NotFoundException('No job found');
    }
    return updatedJob;
  }

  async updateApplicants(applicationId: string, jobId: string) {
    // called service of create-application in controller
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    // Check if the user has already applied for this job

    // if (job.applications.includes(applicationId)) {
    //   return job;
    // } else {
    const updatedJob = await this.jobModel.findByIdAndUpdate(
      jobId,
      { $push: { applications: applicationId } },
      { new: true, useFindAndModify: false },
    );
    // .populate({
    //   path: 'applicantions',
    //   select: 'name email',
    // });
    // console.log('updatedJob', updatedJob);
    return updatedJob;
    // }
  }

  async rejectApplication(dto: RejectDto) {
    const { jobid, applicationId } = dto;

    const applicationFound =
      await this.applicationModel.findById(applicationId);
    if (!applicationFound) {
      throw new NotFoundException('Application not found');
    }

    const jobFound = await this.jobModel.findById(jobid);

    if (!jobFound) {
      throw new NotFoundException('Job not found');
    }
    // rejecting status of application
    applicationFound.statusByCandidate = {
      status: EnumsCandidate.rejectPhase.status,
      message: EnumsCandidate.rejectPhase.message,
    };
    applicationFound.statusByCompany = {
      status: EnumsCandidate.rejectPhase.status,
      message: EnumsCandidate.rejectPhase.message,
    };

    await applicationFound.save();

    // remove application id from job

    const Applications = jobFound.applications.filter((item) => {
      // console.log(item.toString(), applicationId);
      if (item.toString() !== applicationId) {
        return item;
      }
    });
    // console.log(Applications);
    jobFound.applications = Applications;
    return await jobFound.save();
  }

  async remove(jobId: string) {
    return await this.jobModel.findByIdAndDelete(jobId);
  }
}
