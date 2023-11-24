import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { companySubscription } from 'src/company-subscription/entities/company-subscription.entity';
import { Model } from 'mongoose';
import { UpdateCompanySubscriptionDto } from 'src/company-subscription/dto/update-company-subscription.dto';

@Injectable()
export class SubPlanRestrictionsService {
  constructor(
    @InjectModel('companySubscription')
    private readonly companySubscriptionModel: Model<companySubscription>,
  ) {}

  async checkFeaturesAllowed(id: string, QuestionCheckerType: string) {
    const feature = await this.companySubscriptionModel
      .findOne({
        company: id,
      })
      .populate({ path: 'SubscriptionPlan' });

    if (!feature) {
      throw new NotFoundException('Subscription plan not found');
    }

    if (feature.subscriptionStatus === 'expired') {
      throw new BadRequestException(
        'Subscription plan has been expired. Renew your plan to use services',
      );
    }

    if (QuestionCheckerType == 'mcqs') {
      const featuresAllowed = feature.SubscriptionPlan.featuresAllowed;
      const mcqsBank = featuresAllowed.mcqsBank;
      if (mcqsBank === false) {
        return false;
        // throw new BadRequestException('Not allowed to use mcqsBank');
        //provide mccqsByCompany
      } else if (mcqsBank === true) {
        //provide all mcqs
        return true;
      }
      return true;
    }

    if (QuestionCheckerType == 'codingQuestion') {
      const featuresAllowed = feature.SubscriptionPlan.featuresAllowed;
      const codingBank = featuresAllowed.codingBank;
      if (codingBank === false) {
        return false;
      } else if (codingBank === true) {
        return true;
      }
    }

    if (QuestionCheckerType == 'exams') {
      const featuresAllowed = feature.SubscriptionPlan.featuresAllowed;
      const examBank = featuresAllowed.examBank;
      if (examBank === false) {
        return false;
      } else if (examBank === true) {
        return true;
      }
    }
  }

  async checkFeaturesUsed(
    id: string,
    QuestionCheckerType: string,
    tests: any,
    jobs: any,
  ) {
    const feature = await this.companySubscriptionModel
      .findOne({
        company: id,
      })
      .populate({ path: 'SubscriptionPlan' })
      .populate({ path: 'featuresUsed' });

    if (!feature) {
      throw new NotFoundException('Subscription plan not found');
    }

    if (feature.subscriptionStatus === 'expired') {
      throw new BadRequestException(
        'Subscription plan has been expired. Renew your plan to use services',
      );
    }

    if (QuestionCheckerType == 'tests' && tests !== undefined) {
      const planAllowed = feature.SubscriptionPlan.featuresAllowed;
      const planUsed = feature.featuresUsed;

      // check if tests coming is in range
      const canGeneralCreate = planAllowed.testsAllowed - planUsed.testsUsed;
      const GeninLimit = canGeneralCreate < 1;

      if (GeninLimit) {
        throw new BadRequestException(
          `Invite Link creation limit reached! Kindly upgrade your plan`,
        );
      }
    }

    if (QuestionCheckerType == 'jobs' && jobs !== undefined) {
      const planAllowed = feature.SubscriptionPlan.featuresAllowed;
      const planUsed = feature.featuresUsed;

      // check if jobs coming is in range
      const canGeneralCreate = planAllowed.jobsAllowed - planUsed.jobsUsed;
      // console.log('can create more?....', canGeneralCreate);
      const GeninLimit = canGeneralCreate < 1;
      // console.log('is in limit?...', GeninLimit);

      if (GeninLimit) {
        throw new BadRequestException(
          `Job creation limit reached! Kindly upgrade your plan`,
        );
      }
    }

    return feature;
  }

  async updateFeatures(id: string, dto: UpdateCompanySubscriptionDto) {
    // Construct the update object
    const updateObject: any = {};
    if (dto.featuresUsed && dto.featuresUsed.testsUsed) {
      updateObject['featuresUsed.testsUsed'] = dto.featuresUsed.testsUsed;
    }
    if (dto.featuresUsed && dto.featuresUsed.jobsUsed) {
      updateObject['featuresUsed.jobsUsed'] = dto.featuresUsed.jobsUsed;
    }
    // Update the specific field
    return this.companySubscriptionModel
      .findOneAndUpdate({ company: id }, { $set: updateObject }, { new: true })
      .exec();
  }

  // async checkFeaturesUsed(
  //   id: string,
  //   QuestionCheckerType: string,
  //   mcqs: any[],
  //   codingQuestion: any,
  //   exams: any,
  // ) {
  //   const feature = await this.companySubscriptionModel
  //     .findOne({
  //       company: id,
  //     })
  //     .populate({ path: 'SubscriptionPlan' })
  //     .populate({ path: 'featuresUsed' });

  //   if (!feature) {
  //     throw new NotFoundException('Subscription plan not found');
  //   }

  //   if (QuestionCheckerType == 'mcqs' && mcqs !== undefined) {
  //     // console.log('mcqs...');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       mcqAllowed: { general: number; private: number };
  //     };

  //     const subscriptionUsed = feature.featuresUsed as {
  //       mcqUsed: { general: number; private: number };
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate =
  //       planAllowed.mcqAllowed?.general - subscriptionUsed.mcqUsed?.general;
  //     const canPrivateCreate =
  //       planAllowed.mcqAllowed?.private - subscriptionUsed.mcqUsed?.private;

  //     const { generalCount, privateCount } = getQuestionCounts(mcqs);
  //     // console.log(generalCount, privateCount);
  //     // console.log('general remaining', canGeneralCreate, generalCount);
  //     if (generalCount != 0) {
  //       // console.log('general remaining', canGeneralCreate, generalCount);
  //       const GeninLimit = canGeneralCreate < generalCount;

  //       if (GeninLimit) {
  //         throw new BadRequestException(
  //           `Limit ExceedsGEn! can save ${canGeneralCreate} more MCQs`,
  //         );
  //       }
  //     }
  //     if (privateCount != 0) {
  //       // console.log('privateremaining', canPrivateCreate, privateCount);
  //       const PrinLimit = canPrivateCreate < privateCount;
  //       // console.log('private limit', PrinLimit);
  //       if (PrinLimit) {
  //         throw new BadRequestException(
  //           `Limit Exceeds! can save ${canPrivateCreate} more MCQs`,
  //         );
  //       }
  //     }
  //   }

  //   if (
  //     QuestionCheckerType == 'codingQuestion' &&
  //     codingQuestion !== undefined
  //   ) {
  //     // console.log('CQ....');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       codingQuestionAllowed: { general: number; private: number };
  //     };

  //     const planUsed = feature.featuresUsed as unknown as {
  //       codingQuestionUsed: { general: number; private: number };
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate =
  //       planAllowed.codingQuestionAllowed?.general -
  //       planUsed.codingQuestionUsed?.general;
  //     const canPrivateCreate =
  //       planAllowed.codingQuestionAllowed?.private -
  //       planUsed.codingQuestionUsed?.private;

  //     if (codingQuestion.questionType === 'general') {
  //       const GeninLimit = canGeneralCreate < 1;
  //       // console.log('general limit', GeninLimit);

  //       if (GeninLimit) {
  //         throw new BadRequestException(
  //           `Limit ExceedsGEn! can save ${canGeneralCreate} more questions`,
  //         );
  //       }
  //     }
  //     if (codingQuestion.questionType === 'private') {
  //       const PrinLimit = canPrivateCreate < 1;
  //       // console.log('private limit', PrinLimit);
  //       if (PrinLimit) {
  //         throw new BadRequestException(
  //           `Limit Exceeds! can save ${canPrivateCreate} more questions`,
  //         );
  //       }
  //     }
  //   }
  //   if (QuestionCheckerType == 'exams' && exams !== undefined) {
  //     // console.log('exams...');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       examsAllowed: { general: number; private: number };
  //     };

  //     const planUsed = feature.featuresUsed as unknown as {
  //       examsUsed: { general: number; private: number };
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate =
  //       planAllowed.examsAllowed?.general - planUsed.examsUsed?.general;
  //     const canPrivateCreate =
  //       planAllowed.examsAllowed?.private - planUsed.examsUsed?.private;

  //     if (exams.examType === 'general') {
  //       const GeninLimit = canGeneralCreate < 1;
  //       // console.log('general limit', GeninLimit);

  //       if (GeninLimit) {
  //         throw new BadRequestException(
  //           `Limit ExceedsGEn! can save ${canGeneralCreate} more exams`,
  //         );
  //       }
  //     }
  //     if (exams.examType === 'private') {
  //       const PrinLimit = canPrivateCreate < 1;
  //       // console.log('private limit', PrinLimit);
  //       if (PrinLimit) {
  //         throw new BadRequestException(
  //           `Limit Exceeds! can save ${canPrivateCreate} more exams`,
  //         );
  //       }
  //     }
  //   }

  //   return feature;
  // }

  // async checkFeaturesUsed(
  //   id: string,
  //   QuestionCheckerType: string,
  //   mcqs: any[],
  //   codingQuestion: any,
  //   exams: any,
  // ) {
  //   const feature = await this.companySubscriptionModel
  //     .findOne({
  //       company: id,
  //     })
  //     .populate({ path: 'SubscriptionPlan' })
  //     .populate({ path: 'featuresUsed' });

  //   // console.log('feature', feature);
  //   // return;

  //   if (!feature) {
  //     throw new NotFoundException('Subscription plan not found');
  //   }

  //   if (QuestionCheckerType == 'mcqs' && mcqs !== undefined) {
  //     // console.log('mcqs...');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       mcqAllowed: number;
  //     };

  //     const planUsed = feature.featuresUsed as {
  //       mcqUsed: number;
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate = planAllowed.mcqAllowed - planUsed.mcqUsed;
  //     // console.log('canGeneralCreate', canGeneralCreate);

  //     const generalCount = getQuestionCounts(mcqs);
  //     const GeninLimit = canGeneralCreate < generalCount;
  //     // console.log('GeninLimit', GeninLimit);

  //     if (GeninLimit) {
  //       throw new BadRequestException(
  //         `Limit ExceedsGEn! can save ${canGeneralCreate} more MCQs`,
  //       );
  //     }
  //   }

  //   if (
  //     QuestionCheckerType == 'codingQuestion' &&
  //     codingQuestion !== undefined
  //   ) {
  //     // console.log('CQ....');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       codingQuestionAllowed: number;
  //     };

  //     const planUsed = feature.featuresUsed as unknown as {
  //       codingQuestionUsed: number;
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate =
  //       planAllowed.codingQuestionAllowed - planUsed.codingQuestionUsed;
  //     // console.log('canGeneralCreate:', canGeneralCreate);
  //     const GeninLimit = canGeneralCreate < 1;

  //     if (GeninLimit) {
  //       throw new BadRequestException(
  //         `Limit ExceedsGEn! can save ${canGeneralCreate} more questions`,
  //       );
  //     }
  //   }
  //   if (QuestionCheckerType == 'exams' && exams !== undefined) {
  //     // console.log('exams...');
  //     const planAllowed = feature.SubscriptionPlan as unknown as {
  //       examsAllowed: number;
  //     };

  //     const planUsed = feature.featuresUsed as unknown as {
  //       examsUsed: number;
  //     };

  //     // check if mcqs coming is in range
  //     const canGeneralCreate = planAllowed.examsAllowed - planUsed.examsUsed;
  //     const GeninLimit = canGeneralCreate < 1;
  //     // console.log('general limit', GeninLimit);

  //     if (GeninLimit) {
  //       throw new BadRequestException(
  //         `Limit ExceedsGEn! can save ${canGeneralCreate} more exams`,
  //       );
  //     }
  //   }

  //   return feature;
  // }

  // async updateFeatures(id: string, dto: UpdateCompanySubscriptionDto) {
  //   // console.log('dto', dto);

  //   // Construct the update object
  //   const updateObject: any = {};
  //   if (dto.featuresUsed && dto.featuresUsed.mcqUsed) {
  //     updateObject['featuresUsed.mcqUsed'] = dto.featuresUsed.mcqUsed;
  //   }
  //   if (dto.featuresUsed && dto.featuresUsed.examsUsed) {
  //     updateObject['featuresUsed.examsUsed'] = dto.featuresUsed.examsUsed;
  //   }
  //   if (dto.featuresUsed && dto.featuresUsed.codingQuestionUsed) {
  //     updateObject['featuresUsed.codingQuestionUsed'] =
  //       dto.featuresUsed.codingQuestionUsed;
  //   }
  //   if (dto.featuresUsed && dto.featuresUsed.testsUsed) {
  //     updateObject['featuresUsed.testsUsed'] = dto.featuresUsed.testsUsed;
  //   }

  //   // Update the specific field
  //   return await this.companySubscriptionModel
  //     .findOneAndUpdate({ company: id }, { $set: updateObject }, { new: true })
  //     .exec();
  // }
}
