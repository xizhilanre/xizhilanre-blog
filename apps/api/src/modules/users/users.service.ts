import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash -email')
      .lean();
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    const allowed = ['username', 'avatar', 'bio'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        update[key] = data[key];
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select('-passwordHash');

    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async addFavorite(userId: string, articleId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: articleId } },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return { favorites: user.favorites };
  }

  async removeFavorite(userId: string, articleId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favorites: articleId } },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return { favorites: user.favorites };
  }
}
