import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll(userId?: string) {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
      },
    });

    if (!userId) {
      return products.map((p) => ({
        ...p,
        isInCart: false,
      }));
    }

    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId: userId },
      select: { productId: true },
    });

    const cartProductIds = new Set(cartItems.map((item) => item.productId));

    const favoriteItems = await this.prisma.wishlistItem.findMany({
      where: { userId: userId },
      select: { productId: true },
    });

    const favoriteProductIds = new Set(
      favoriteItems.map((item) => item.productId),
    );

    return products.map((p) => ({
      ...p,
      isInCart: userId ? cartProductIds.has(p.id) : false,
      isFavorite: userId ? favoriteProductIds.has(p.id) : false,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
