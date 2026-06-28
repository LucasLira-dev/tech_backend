/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';

@Injectable()
export class WishListService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishList(userId: string) {
    const wishList = await this.prisma.wishlistItem.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
    });

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        userId,
      },
      select: {
        productId: true,
      },
    });

    const cartProductIds = new Set(cartItems.map((item) => item.productId));

    return wishList.map((item) => ({
      ...item,
      isInCart: cartProductIds.has(item.productId),
    }));
  }

  async toogle(productId: string, userId: string) {
    try {
      await this.prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
      return { message: 'Product added to wish list' };
    } catch (error: any) {
      if (error.code === 'P2002') {
        await this.prisma.wishlistItem.deleteMany({
          where: { userId, productId },
        });
        return { message: 'Product removed from wish list' };
      }
      throw error;
    }
  }
}
