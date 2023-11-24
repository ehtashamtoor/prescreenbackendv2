import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private SubscriptionPlanModel: Model<SubscriptionPlan>,
  ) {}

  async checkPlanTitleUniqueness(planTitle: string): Promise<void> {
    const existingPlan = await this.SubscriptionPlanModel.findOne({
      planTitle: new RegExp(`^${planTitle}$`, 'i'),
    });

    if (existingPlan) {
      throw new ConflictException('Plan title must be unique');
    }
  }

  async create(dto: CreateSubscriptionPlanDto) {
    // CHECK IF PLAN TITLE IS UNIQUE
    await this.checkPlanTitleUniqueness(dto.planTitle);
    // CREATE PLAN NOW
    const plan = new this.SubscriptionPlanModel(dto);
    // console.log('plan', plan);
    return plan.save();
  }

  findAll() {
    return this.SubscriptionPlanModel.find().exec();
  }
  async findActivePlans() {
    const pipeLine = [
      {
        $unwind: '$pricing',
      },
      {
        $group: {
          _id: '$pricing.billingCycle',
          plans: {
            $push: {
              _id: '$_id',
              planTitle: '$planTitle',
              description: '$description',
              isActive: '$isActive',
              featuresAllowed: '$featuresAllowed',
              pricing: '$pricing',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          billingCycle: '$_id',
          plans: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              k: '$billingCycle',
              v: '$plans',
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: '$data',
            // $mergeObjects: { $arrayToObject: '$data' },
          },
        },
      },
    ];

    let result = await this.SubscriptionPlanModel.aggregate(pipeLine);
    const sortByPrice = (a: any, b: any) => a.pricing.price - b.pricing.price;
    const monthly = result[0].monthly.sort(sortByPrice);
    const yearly = result[0].yearly.sort(sortByPrice);
    result = [{ monthly, yearly }];
    // console.log(result);
    return result.length > 0 ? result.pop() : {};
  }

  async findById(id: string) {
    const plan = await this.SubscriptionPlanModel.findById(id);

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }
  async findFreePlan() {
    const plan = await this.SubscriptionPlanModel.findOne({
      isActive: true,
      $and: [{ 'pricing.0.price': 0 }, { 'pricing.1.price': 0 }],
    });

    if (!plan) {
      throw new NotFoundException('Free Plan not found');
    }
    return plan;
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto) {
    const updatedPlan = await this.SubscriptionPlanModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!updatedPlan) {
      throw new NotFoundException('Plan not found');
    }
    return updatedPlan;
  }
  async updateStatus(id: string, action: string) {
    const planFound = await this.SubscriptionPlanModel.findById(id);
    if (!planFound) {
      throw new NotFoundException('Plan not found');
    }
    const ActivePlans = await this.SubscriptionPlanModel.find({
      isActive: true,
    });

    if (action === 'deactivate') {
      planFound.isActive = false;
    } else if (action === 'activate') {
      if (ActivePlans.length >= 3) {
        throw new BadRequestException(
          "You can't have more than three active plans, deactivate one first",
        );
      }

      // now update the planFound to active
      planFound.isActive = true;
    }
    await planFound.save();
    return planFound;
  }

  async remove(id: string) {
    const isDeleted = await this.SubscriptionPlanModel.findByIdAndDelete(id);
    if (!isDeleted) {
      throw new NotFoundException('No Plan found');
    }

    return {
      message: 'Plan deleted Successfully',
    };
  }
}
