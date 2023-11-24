import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CandidateDto } from './dto/create-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { User } from 'src/user/entities/user.schema';
import { Qualifications } from './dto/updatecandidate.dto';
import { CandidateApplication } from 'src/candidate-application/entities/candidate-application.entity';
import { RandomCandidateDto } from './dto/create-randomCandidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private CandidateModel: Model<Candidate>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(CandidateApplication.name)
    private candApplicationModel: Model<CandidateApplication>,
  ) {}

  async create(
    candidateDto: CandidateDto,
    hashedPass: string = '',
  ): Promise<{ candidate: Candidate }> {
    candidateDto.password = hashedPass;
    const newCandidate = new this.CandidateModel(candidateDto);
    const createdCandidate = await newCandidate.save();
    return {
      candidate: createdCandidate,
    };
  }
  async createRandomCandidate(candidateDto: RandomCandidateDto) {
    const newCandidate = new this.CandidateModel(candidateDto);
    const createdCandidate = await newCandidate.save();
    return createdCandidate;
  }

  // async changePassword(email: string, newPassword: string) {
  // const candidate = await this.CandidateModel.findOne({ email });
  //   if (!candidate) {
  //     throw new NotFoundException('No candidate with this email');
  //   }
  //   candidate.password = newPassword;
  //   return await candidate.save();
  // }

  async findAll(page?: number, limit?: number) {
    let result;

    if (page !== undefined && limit !== undefined) {
      let skip = (page - 1) * limit;
      if (skip < 0) {
        skip = 0;
      }

      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            candidates: [{ $skip: skip }, { $limit: +limit }],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    } else {
      result = await this.CandidateModel.aggregate([
        {
          $facet: {
            candidates: [],
            totalDocs: [{ $count: 'count' }],
          },
        },
      ]);
    }
    const candidates = result[0].candidates;
    const totalDocs =
      result[0].totalDocs.length > 0 ? result[0].totalDocs[0].count : 0;

    if (!candidates) {
      throw new NotFoundException('Failed to fetch Candidates');
    }

    return {
      allCandidates: candidates,
      total: totalDocs,
    };
  }

  async findById(id: string): Promise<Candidate | null> {
    const candidate = await this.CandidateModel.findById(id).exec();
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    return candidate;
  }

  async getCandProfileById(id: string) {
    const candidate = await this.CandidateModel.findById(id).exec();
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    const pipeline = [
      {
        $match: {
          createdBy: candidate.createdBy,
        },
      },
      {
        $lookup: {
          from: 'candidateapplications',
          localField: 'candidate',
          foreignField: 'createdBy.candidate',
          as: 'candidateapplications',
        },
      },
    ];

    const candidates = await this.candApplicationModel
      .aggregate(pipeline)
      .exec();
    const result = {
      candidate: candidate.toObject(),
      candidates,
    };
    return result;
  }

  async updateCandidate(id: string, updateCandidateDto: UpdateCandidateDto) {
    let updatedData = {};

    if (Object.keys(updateCandidateDto)[0] === 'skills') {
      updatedData = {
        $push: updateCandidateDto,
      };
    } else if (Object.keys(updateCandidateDto)[0] === 'educationDetails') {
      updatedData = {
        $push: updateCandidateDto,
      };
    } else if (Object.keys(updateCandidateDto)[0] === 'experiences') {
      updatedData = {
        $push: updateCandidateDto,
      };
    } else {
      updatedData = {
        $set: updateCandidateDto,
      };
    }
    const updatedCandidate = await this.CandidateModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true },
    ).exec();
    if (!updatedCandidate) {
      throw new InternalServerErrorException('Failed to update Candidate');
    }

    if (updateCandidateDto.email || updateCandidateDto.name) {
      const userObj = {
        email: updateCandidateDto.email,
        name: updateCandidateDto.name,
      };

      const isUserUpdated = await this.UserModel.findOneAndUpdate(
        {
          candidate: id,
        },
        userObj,
        { new: true },
      );

      if (!isUserUpdated) {
        throw new InternalServerErrorException('Failed to update User');
      }
    }

    return {
      candidate: updatedCandidate,
    };
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    const updatedUploads = await this.CandidateModel.findByIdAndUpdate(
      id,
      updateCandidateDto,
      { new: true },
    ).exec();
    if (!updatedUploads) {
      throw new BadRequestException('Failed to update Candidate');
    }
    return {
      candidate: updatedUploads,
    };
  }

  async updateField(id: string, itemId: string, updateData: Qualifications) {
    if (
      Object.keys(updateData)[0] !== 'skills' &&
      Object.keys(updateData)[0] !== 'educationDetails' &&
      Object.keys(updateData)[0] !== 'educationDetails' &&
      Object.keys(updateData)[0] !== 'experiences'
    ) {
      throw new BadRequestException('Irrelevent update');
    }
    const candidate = await this.CandidateModel.findById(id);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const targetField = (candidate as any)[Object.keys(updateData)[0]].id(
      itemId,
    );

    if (!targetField) {
      throw new NotFoundException(`${Object.keys(updateData)[0]} not found`);
    }

    Object.assign(targetField, Object.values(updateData)[0]);
    await candidate.save();
    return {
      candidate: candidate,
    };
  }

  async remove(candId: string, itemId: string, fieldType: string) {
    const candidate: any = await this.CandidateModel.findById(candId);

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const targetArray = candidate[fieldType];

    if (!Array.isArray(targetArray)) {
      throw new NotFoundException(`${fieldType} not found`);
    }

    const updatedArray = targetArray.filter(
      (item: any) => item._id.toString() !== itemId,
    );

    if (updatedArray.length === targetArray.length) {
      throw new NotFoundException(
        `${fieldType} not found with the given itemId`,
      );
    }

    candidate[fieldType] = updatedArray;
    await candidate.save();
    return { candidate };
  }

  // async findSkillById(Id: string, type: string) {
  //   let candidates;
  //   if (type === 'skills') {
  //     candidates = await this.CandidateModel.find({
  //       'skills._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const skill = candidate.skills.find((s) => s._id.toString() === Id);
  //       if (skill) {
  //         return skill;
  //       }
  //     }
  //   }
  //   if (type === 'educationDetails') {
  //     candidates = await this.CandidateModel.find({
  //       'educationDetails._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const educationDetails = candidate.educationDetails.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (educationDetails) {
  //         return educationDetails;
  //       }
  //     }
  //   }
  //   if (type === 'experiences') {
  //     candidates = await this.CandidateModel.find({
  //       'experiences._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const experiences = candidate.experiences.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (experiences) {
  //         return experiences;
  //       }
  //     }
  //   }
  //   throw new NotFoundException('Candidate not found');
  // }

  // async updateField(Id: string, type: string, updateData: UpdateCandidate) {
  //   let candidates;
  //   if (type === 'skills') {
  //     candidates = await this.CandidateModel.find({
  //       'skills._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const skill = candidate.skills.find((s) => s._id.toString() === Id);
  //       if (skill) {
  //         return skill;
  //       }
  //     }
  //   }
  //   if (type === 'educationDetails') {
  //     candidates = await this.CandidateModel.find({
  //       'educationDetails._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const educationDetails = candidate.educationDetails.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (educationDetails) {
  //         return educationDetails;
  //       }
  //     }
  //   }
  //   if (type === 'experiences') {
  //     candidates = await this.CandidateModel.find({
  //       'experiences._id': Id,
  //     }).exec();

  //     for (const candidate of candidates) {
  //       const experiences = candidate.experiences.find(
  //         (s) => s._id.toString() === Id,
  //       );
  //       if (experiences) {
  //         return experiences;
  //       }
  //     }
  //   }
  //   throw new NotFoundException('Candidate not found');
  // }

  // async remove(id: string) {
  //   const deletedCandidate =
  //     await this.CandidateModel.findByIdAndRemove(id).exec();
  //   if (!deletedCandidate) {
  //     throw new BadRequestException('Failed to delete Candidate');
  //   }
  //   return { message: 'Candidate deleted successfully' };
  // }
}
