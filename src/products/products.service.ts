import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
      },
    });

    return product;
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

  async findOne(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const isInCart = await this.prisma.cartItem.findFirst({
      where: { userId, productId: id },
    });

    const isFavorite = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId: id },
    });

    return {
      ...product,
      isInCart: !!isInCart,
      isFavorite: !!isFavorite,
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
      },
    });

    return updatedProduct;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: `Product with ID ${id} has been deleted` };
  }
}
