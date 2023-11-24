import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CandidateApplication } from './entities/candidate-application.entity';
import { EnumsCandidate, EnumsCompany } from 'src/utils/classes';
import { JobService } from 'src/job/job.service';

@Injectable()
export class CandidateApplicationService {
  constructor(
    @InjectModel(CandidateApplication.name)
    private CandApplicationModel: Model<CandidateApplication>,
    private readonly jobService: JobService,
  ) {}

  async create(userId: string, job: string) {
    // Check if an application with the same user and candidate IDs already exists
    const existingApplication = await this.CandApplicationModel.findOne({
      candidate: userId,
      job: job,
    });

    if (existingApplication) {
      throw new BadRequestException('User has already applied for this job.');
    }

    // Set the default value for status, in case of Dto
    // if (!dto.status) {
    //   dto.status = 'applied';
    // }

    // If no existing application, create a new one
    const application = await this.CandApplicationModel.create({
      candidate: userId,
      job,
      statusByCandidate: {
        status: EnumsCandidate.applyPhase.status,
        message: EnumsCandidate.applyPhase.message,
      },
      statusByCompany: {
        status: EnumsCompany.applyPhase.status,
        message: EnumsCompany.applyPhase.message,
      },
    });
    // .populate({
    //   path: 'candidate',
    //   select: 'name email',
    // });

    // console.log('application>>', application);
    return { message: 'Candidate Application has been submitted', application };
  }

  async findAll(page?: number, limit?: number) {
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const applications = result[0].applications;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      applications: applications,
      total: totalDocs,
    };
  }

  async getCandidateStatusCounts(userId: string): Promise<any> {
    const pipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $match: {
          'job.createdBy': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$statusByCandidate.status',
          count: { $sum: 1 },
        },
      },
    ];

    const candidateStatusCounts =
      await this.CandApplicationModel.aggregate(pipeline);
    // console.log('pipeline', candidateStatusCounts);

    // Create a result object
    const result: {
      [key: string]: number;
    } = {};

    // Populate the result object with counts for all statuses
    for (const entry of candidateStatusCounts) {
      result[entry._id] = entry.count;
    }
    // console.log('result....', result);

    return result;
  }

  async getCompanyStatusCounts(userId: string): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $match: {
          'job.createdBy': new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$statusByCompany.status',
          count: { $sum: 1 },
          message: { $first: '$statusByCompany.message' },
        },
      },
    ];

    const companyStatusCounts =
      await this.CandApplicationModel.aggregate(pipeline);

    // Create an array to store the result objects
    const result: { status: string; count: number; message: string }[] = [];

    // Populate the result array with objects for all statuses
    for (const entry of companyStatusCounts) {
      result.push({
        status: entry._id,
        count: entry.count,
        message: entry.message,
      });
    }

    return result;
  }

  async updatestatusByCompany(
    dto: { jobid: string; email: string },
    status: string,
    message: string,
  ) {
    const { jobid, email } = dto;

    // console.log('status by company....', dto);
    const applications = await this.CandApplicationModel.find({
      job: jobid,
    }).populate({
      path: 'candidate',
      select: 'email name',
    });

    // now match the email field also to get required application
    const requiredDocument = applications.filter((application) => {
      return application.candidate.email === email;
    });
    if (requiredDocument.length == 0) {
      throw new NotFoundException('Application not found');
    }
    // console.log('application....', requiredDocument);

    // now find that document and update it
    const applicationToUpdate = await this.CandApplicationModel.findById(
      requiredDocument[0].id,
    );
    if (applicationToUpdate) {
      // Check if the application is hired
      if (status.toLowerCase() === 'hired') {
        // Call closeJob service to update job status to 'closed'
        await this.jobService.closeJob(jobid);
      }
      applicationToUpdate.statusByCompany = {
        status,
        message,
      };

      // console.log('applicationToUpdate', applicationToUpdate);

      return await applicationToUpdate.save();
    }
  }

  async updatestatusByCandidate(
    dto: { jobid: string; email: string },
    status: string,
    message: string,
  ) {
    const { jobid, email } = dto;
    // console.log('inside statusby candidate', dto);
    const applications = await this.CandApplicationModel.find({
      job: jobid,
    }).populate({
      path: 'candidate',
      select: 'email name',
    });
    // console.log('application....>', applications);
    // now match the email field also to get required application
    const requiredDocument = applications.filter((application) => {
      return application.candidate.email === email;
    });
    if (requiredDocument.length == 0) {
      throw new NotFoundException('Application not found');
    }
    // console.log('application....>', requiredDocument);

    // now find that document and update it
    const applicationToUpdate = await this.CandApplicationModel.findById(
      requiredDocument[0].id,
    );
    if (applicationToUpdate) {
      applicationToUpdate.statusByCandidate = {
        status,
        message,
      };
      return await applicationToUpdate.save();
    }
  }

  async getStatusByCandidate(jobId: string) {
    const candidateApplicationAnalytics =
      await this.CandApplicationModel.aggregate([
        {
          $match: {
            job: new mongoose.Types.ObjectId(jobId),
          },
        },
        {
          $group: {
            _id: {
              statusByCompany: '$statusByCompany.status',
              statusByCandidate: '$statusByCandidate.status',
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            statusByCompany: '$_id.statusByCompany',
            statusByCandidate: '$_id.statusByCandidate',
            count: 1,
          },
        },
      ]);

    return candidateApplicationAnalytics;
  }

  async findOne(id: string) {
    const applicationFound = await this.CandApplicationModel.findById(
      id,
    ).populate({
      path: 'candidate',
      select: 'candidates',
      populate: {
        path: 'candidate',
        // select: 'name email'
      },
    });

    if (!applicationFound) {
      throw new NotFoundException('Application not found');
    }
    return applicationFound;
  }

  async findByCandidate(userid: string, page?: number, limit?: number) {
    let result;
    const matchStage: any = {
      candidate: new mongoose.Types.ObjectId(userid),
    };

    const lookup = {
      $lookup: {
        from: 'jobs', // collection named from which lookup
        localField: 'job',
        foreignField: '_id',
        as: 'jobInfo',
        pipeline: [
          { $project: { title: 1, jobStatus: 2, applicationDeadline: 3 } },
        ],
      },
    };

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [
              { $match: matchStage },
              lookup,
              { $skip: skip },
              { $limit: +limit },
            ],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandApplicationModel.aggregate([
        {
          $facet: {
            applications: [{ $match: matchStage }, lookup],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    }

    const applications = result[0].applications;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    return {
      applications: applications,
      total: totalDocs,
    };
  }

  async update(id: string, dto: UpdateCandidateApplicationDto) {
    // console.log('Candidate update DTO....', dto);
    // Check for status update by candidate
    // if (dto.status !== 'applied') {
    //   throw new Error('Status cannot be changed by candidate');
    // }
    const updatedApplication =
      await this.CandApplicationModel.findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      });

    return updatedApplication;
  }

  async remove(id: string) {
    const isdeleted = await this.CandApplicationModel.findByIdAndDelete(id);
    console.log('Deleted candaidate application', isdeleted);

    return {
      message: 'Application deleted successfully',
    };
  }

  async findByjobEmail(jobid: string, email: string) {
    const application = await this.CandApplicationModel.findOne({
      job: jobid,
    }).populate({
      path: 'candidate',
      match: { email: email },
      select: 'email',
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async findByUserEmail(jobid: string, id: string) {
    const application = await this.CandApplicationModel.findOne({
      job: jobid,
      candidate: id,
    }).populate({
      path: 'candidate',
      match: { _id: id },
      select: 'email',
    });
    if (!application) {
      // throw new BadRequestException('APP NOT FOUND')
      return {
        // application: { id: null },
        success: false,
      };
    }

    return {
      application,
      success: true,
    };
  }
}
