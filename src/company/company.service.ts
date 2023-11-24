import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './entities/company.entity';
import { User } from 'src/user/entities/user.schema';
import { Job } from 'src/job/entities/job.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private CompanyModel: Model<Company>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async create(companyDto: CompanyDto): Promise<{ company: Company }> {
    const existingCompany = await this.CompanyModel.findOne({
      name: companyDto.name,
    });

    if (existingCompany) {
      throw new ConflictException('Company name is already in use');
    }
    const newCompany = new this.CompanyModel(companyDto);
    const createdCompany = await newCompany.save();
    return { company: createdCompany };
  }

  async findAll(page?: number, limit?: number, companyTitle?: string) {
    let result;
    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CompanyModel.aggregate([
        {
          $facet: {
            allCompanies: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else if (companyTitle) {
      // Make the name case-insensitive also match substrings
      const matchStage = { name: { $regex: new RegExp(companyTitle, 'i') } };

      result = await this.CompanyModel.aggregate([
        {
          $facet: {
            allCompanies: [{ $match: matchStage }],
            totalDocs: [{ $match: matchStage }, { $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CompanyModel.aggregate([
        {
          $facet: {
            allCompanies: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const allCompanies = result[0].allCompanies;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;
    if (!allCompanies) {
      throw new NotFoundException('Failed to fetch Companies');
    }
    return {
      companies: allCompanies,
      total: totalDocs,
    };
  }

  // async companyAnalytics() {
  //   const companyAnalytics = (await this.CompanyModel.aggregate([
  //     {
  //       $match: {
  //         // Specify the field using for 'k' that should not be null
  //         industry: { $ne: null },
  //         country: { $ne: null },
  //       },
  //     },
  //     {
  //       $facet: {
  //         industryCounts: [
  //           {
  //             $group: {
  //               _id: '$industry',
  //               count: { $sum: 1 },
  //             },
  //           },
  //         ],
  //         countryCounts: [
  //           {
  //             $group: {
  //               _id: '$country',
  //               count: { $sum: 1 },
  //             },
  //           },
  //         ],
  //         totalCompaniesCount: [
  //           {
  //             $group: {
  //               _id: null,
  //               totalCount: { $sum: 1 },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $unwind: '$industryCounts',
  //     },
  //     {
  //       $unwind: '$countryCounts',
  //     },
  //     {
  //       $group: {
  //         _id: null,
  //         industryCounts: {
  //           $push: {
  //             k: '$industryCounts._id',
  //             v: '$industryCounts.count',
  //           },
  //         },
  //         countryCounts: {
  //           $push: {
  //             k: '$countryCounts._id',
  //             v: '$countryCounts.count',
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $replaceRoot: {
  //         newRoot: {
  //           $mergeObjects: [
  //             { $arrayToObject: '$industryCounts' },
  //             { $arrayToObject: '$countryCounts' },
  //             { $arrayToObject: '$totalCompaniesCount' },
  //           ],
  //         },
  //       },
  //     },
  //   ])) as any;

  //   console.log(companyAnalytics);
  //   return companyAnalytics.length > 0 ? companyAnalytics.pop() : {};
  // }

  async companyAnalytics() {
    const pipeline = [
      {
        $group: {
          _id: null,
          'Total Companies': {
            $sum: { $cond: [{ $eq: ['$userType', 'company'] }, 1, 0] },
          },
          'Total Candidates': {
            $sum: { $cond: [{ $eq: ['$userType', 'candidate'] }, 1, 0] },
          },
          totalUsers: { $sum: 1 },
          blockedCompanies: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$userType', 'company'] }, '$isBlocked'] },
                1,
                0,
              ],
            },
          },
          blockedCandidates: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$userType', 'candidate'] }, '$isBlocked'] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          'Active Companies': {
            $subtract: ['$Total Companies', '$blockedCompanies'],
          },
          'Blocked Companies': '$blockedCompanies',
          'Total Companies': '$Total Companies',
          'Active Candidates': {
            $subtract: ['$Total Candidates', '$blockedCandidates'],
          },
          'Blocked Candidates': '$blockedCandidates',
          'Total Candidates': '$Total Candidates',
        },
      },
    ];

    const result = await this.UserModel.aggregate(pipeline).exec();
    const finalResult = result.length > 0 ? result[0] : {};
    return finalResult;

    return await this.UserModel.aggregate(pipeline);
  }

  // async companyProfile(id: string): Promise<Company | null> {
  //   const company = await this.CompanyModel.findById(id);
  //   if (!company) {
  //     throw new NotFoundException('Company not found');
  //   }

  //   const companyId = company.id;
  //   const companyJobs = await this.jobService.findByCompany(companyId);
  //   // Create a new Company object with the retrieved company data and the array of jobs
  //   const companyWithJobs: Company = {
  //     jobs: companyJobs,
  //   };
  //   return companyWithJobs;
  // }

  async findById(id: string): Promise<Company | null> {
    const company = await this.CompanyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async getCompanyProfileById(id: string) {
    const company = await this.CompanyModel.findById(id).exec();
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    // TODO check company or user
    const pipeline = [
      {
        $match: {
          createdBy: company.createdBy,
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'createdBy',
          foreignField: 'createdBy.company',
          as: 'jobInfo',
        },
      },
    ];

    const jobs = await this.jobModel.aggregate(pipeline).exec();

    // // Calculate statistics
    // const totalJobs = jobs.length;
    // const totalClosedJobs = jobs.filter(
    //   (job) => job.jobStatus === 'closed',
    // ).length;
    // const totalOpenJobs = jobs.filter((job) => job.jobStatus === 'open').length;

    // const totalApplications = jobs.reduce(
    //   (total, job) => total + job.applications.length,
    //   0,
    // );

    // // Calculate total applications per job
    // const applicationsPerJob = jobs.map((job) => ({
    //   jobId: job._id,
    //   jobTitle: job.title,
    //   totalApplications: job.applications.length,
    //   openDate: job.createdAt,
    //   closingDate: job.applicationDeadline,
    // }));

    // return {
    //   company: company,
    //   companyJobs: jobs,
    //   totalJobs: totalJobs,
    //   totalClosedJobs: totalClosedJobs,
    //   totalOpenJobs: totalOpenJobs,
    //   totalApplications: totalApplications,
    //   applicationsPerJob: applicationsPerJob,
    // };
    return {
      company: company,
      companyJobs: jobs,
    };
    // const result = {
    //   company: company.toObject(),
    //   jobs,
    // };
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const existingCompany = await this.CompanyModel.findOne({
      name: updateCompanyDto.name,
      _id: { $ne: id }, // exclude the current companyId being updated
    });

    if (existingCompany) {
      throw new ConflictException('Company name is already in use');
    }
    updateCompanyDto.name?.trim();

    const updatedCompany = await this.CompanyModel.findByIdAndUpdate(
      id,
      updateCompanyDto,
      { new: true },
    ).exec();

    if (!updatedCompany) {
      throw new InternalServerErrorException('Failed to update Company');
    }

    const userObj = {
      email: updateCompanyDto.email,
      name: updateCompanyDto.name,
    };

    const isUserUpdated = await this.UserModel.findOneAndUpdate(
      {
        company: id,
      },
      userObj,
      { new: true },
    );
    if (!isUserUpdated) {
      throw new InternalServerErrorException('Failed to update User');
    }
    return { company: updatedCompany, message: 'Company updated successfully' };
  }
}
