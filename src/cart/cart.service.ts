import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CartDto: CartDto, userId: string) {
    const { productId } = CartDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    if (existingCartItem) {
      throw new ConflictException('Product is already in the cart');
    }

    const cartItem = await this.prisma.cartItem.create({
      data: {
        userId: userId,
        productId: productId,
      },
    });

    return cartItem;
  }

  async findAll(userId: string) {
    const productsInCart = await this.prisma.cartItem.findMany({
      where: { userId: userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return productsInCart;
  }

  async increaseQuantity(updateCartDto: UpdateCartDto, userId: string) {
    const { productId } = updateCartDto;

    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    await this.prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findFirst({
        where: {
          userId,
          productId,
        },
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              stock: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new BadRequestException('Product is not in the cart');
      }

      if (cartItem.quantity >= cartItem.product.stock) {
        throw new BadRequestException(
          'Cannot increase quantity beyond available stock',
        );
      }

      await tx.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    });
  }

  async decreaseQuantity(updateCartDto: UpdateCartDto, userId: string) {
    const { productId } = updateCartDto;

    if (!productId) throw new BadRequestException('Product ID is required');

    await this.prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        select: { id: true, quantity: true },
      });

      if (!cartItem)
        throw new BadRequestException('Product is not in the cart.');

      if (cartItem.quantity <= 1) {
        await tx.cartItem.delete({
          where: {
            id: cartItem.id,
          },
        });
        return { message: 'Product removed from cart' };
      }

      return tx.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    });
  }

  async removeFromCart(removeCartDto: CartDto, userId: string) {
    const { productId } = removeCartDto;

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });

    if (!existingCartItem) {
      throw new BadRequestException('Product is not in the cart');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: existingCartItem.id,
      },
    });

    return { message: 'Product removed from cart successfully' };
  }
}
