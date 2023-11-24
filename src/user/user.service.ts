import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';
import { UpdateUserDto } from './dto/update_user.dto';
import { CreateUserDto } from './dto/create_user.dto';
import { CreateNewUserDto } from './dto/newUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async create(ceateUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.UserModel(ceateUserDto);
    return newUser.save();
  }

  async createRandomUser(dto: CreateNewUserDto): Promise<User> {
    const newUser = new this.UserModel(dto);
    return newUser.save();
  }

  async changePassword(user: User, newPassword: string) {
    user.password = newPassword;
    return await user.save();
  }
  async blockUser(userId: string) {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      { _id: userId, userType: 'company' },
      { $set: { isBlocked: true } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return { message: 'Company blocked' };
  }
  async unBlockUser(userId: string) {
    const updatedUser = await this.UserModel.findOneAndUpdate(
      { _id: userId, userType: 'company' },
      { $set: { isBlocked: false } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return { message: 'Company unBlocked' };
  }

  async GetUser(id: string): Promise<User> {
    // checking if the id has correct length
    if (id.length !== 24) {
      throw new NotFoundException('Id is wrong....');
    }
    const userFound = await this.UserModel.findById(id);
    // console.log(userFound);
    if (!userFound) {
      throw new NotFoundException('User not found');
    }

    return userFound;
  }
  async getAdminDetails(userId: string): Promise<User> {
    // checking if the id has correct length
    if (userId.length !== 24) {
      throw new NotFoundException('Id is wrong....');
    }
    const userFound = await this.UserModel.findById(userId);
    // console.log(userFound);
    if (!userFound) {
      throw new NotFoundException('Admin not found');
    }

    return userFound;
  }

  async findByEmail(email: string) {
    const user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      return {
        message: 'User not found',
      };
    }
    return {
      message: 'User found',
      user,
    };
  }
  async findById(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneUser(email: string) {
    const user = await this.UserModel.findOne({ email });

    if (!user) {
      return false;
    }
    return true;
  }
  async findOneUserByemail(email: string) {
    const user = await this.UserModel.findOne({ email });

    if (user) {
      return user;
    }
    return false;
  }
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.UserModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    // console.log('updateduser', updatedUser);
    return updatedUser;
  }

  remove(id: string) {
    return this.UserModel.findByIdAndDelete(id);
  }
}
