import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, requesterId: string, requesterRole: string) {
    if (id !== requesterId && requesterRole !== 'admin') {
      throw new ForbiddenException('Cannot update another user\'s profile');
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userModel.findByIdAndUpdate(id, { password: hashed }).exec();
    return { message: 'Password updated successfully' };
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async getWishlist(userId: string) {
    const user = await this.userModel.findById(userId).select('wishlist').exec();
    if (!user) throw new NotFoundException('User not found');
    return user.wishlist || [];
  }

  async syncWishlist(userId: string, items: Array<{ id: string; type: string; item: any; savedAt?: string }>) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    user.wishlist = (items || []).map((entry) => ({
      id: String(entry.id),
      type: entry.type as any,
      item: entry.item || {},
      savedAt: entry.savedAt || new Date().toISOString(),
    }));
    await user.save();
    return user.wishlist;
  }

  async toggleWishlistItem(userId: string, itemData: { id: string; type: string; item: any }) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (!user.wishlist) user.wishlist = [];

    const strId = String(itemData.id);
    const existingIndex = user.wishlist.findIndex((w) => String(w.id) === strId);

    if (existingIndex >= 0) {
      user.wishlist.splice(existingIndex, 1);
    } else {
      user.wishlist.unshift({
        id: strId,
        type: itemData.type as any,
        item: itemData.item || {},
        savedAt: new Date().toISOString(),
      });
    }

    user.markModified('wishlist');
    await user.save();
    return user.wishlist;
  }

  async removeFromWishlist(userId: string, targetId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.wishlist = (user.wishlist || []).filter(
      (w) => String(w.id) !== String(targetId) && String((w as any).targetId) !== String(targetId),
    );
    user.markModified('wishlist');
    await user.save();
    return user.wishlist;
  }

  async clearWishlist(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.wishlist = [];
    user.markModified('wishlist');
    await user.save();
    return [];
  }
}
