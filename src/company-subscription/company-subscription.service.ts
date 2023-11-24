import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanySubscriptionDto } from './dto/create-company-subscription.dto';
import { UpdateCompanySubscriptionDto } from './dto/update-company-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { companySubscription } from './entities/company-subscription.entity';

@Injectable()
export class CompanySubscriptionService {
  constructor(
    @InjectModel('companySubscription')
    private readonly companySubscriptionModel: Model<companySubscription>,
  ) {}
  async create(dto: CreateCompanySubscriptionDto) {
    const CompanySubscription = await this.companySubscriptionModel.create(dto);
    return CompanySubscription;
  }

  async findPlansToRenew(reminderDate: Date) {
    return await this.companySubscriptionModel
      .find({
        subscriptionEndDate: { $gte: reminderDate },
      })
      .populate({ path: 'company' });
  }

  async findPlansWithExpiredDeadlines(currentTime: Date) {
    return await this.companySubscriptionModel
      .find({
        subscriptionEndDate: { $lt: currentTime },
      })
      .populate({ path: 'company' });
  }

  async closePlans(compSubId: string) {
    // console.log('compSubId', compSubId);
    return this.companySubscriptionModel.findByIdAndUpdate(
      compSubId,
      { subscriptionStatus: 'expired' },
      { new: true },
    );
  }

  async findAll() {
    return this.companySubscriptionModel.find().populate({
      path: 'company SubscriptionPlan',
      select: 'name email isBlocked planTitle',
    });
  }

  async findOne(id: string) {
    const subFound = await this.companySubscriptionModel
      .findById(id)
      .populate({
        path: 'company',
        select: 'company featuresUsed isBlocked',
        populate: { path: 'company' },
      })
      .populate({ path: 'SubscriptionPlan' });

    if (!subFound) {
      throw new NotFoundException('Subscription not found');
    }
    return subFound;
  }

  async find(userid: string) {
    const isFound = await this.companySubscriptionModel
      .findOne({ company: userid })
      .populate({ path: 'SubscriptionPlan' });

    return isFound;
  }

  async update(id: string, dto: UpdateCompanySubscriptionDto) {
    const isUpdated = await this.companySubscriptionModel
      .findByIdAndUpdate(id, dto)
      .exec();

    if (!isUpdated) {
      throw new BadRequestException('invalid id or something');
    }

    if (dto.intentId && isUpdated.paymentIntentIds) {
      isUpdated.paymentIntentIds.push(dto.intentId);
      await isUpdated.save();
    }

    return isUpdated;
  }

  async remove(id: string) {
    return this.companySubscriptionModel.findByIdAndRemove(id).exec();
  }
}
