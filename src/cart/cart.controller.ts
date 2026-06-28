import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/add')
  create(@Body() CartDto: CartDto, @Session() session: UserSession) {
    return this.cartService.create(CartDto, session?.user?.id);
  }

  @Get('/products')
  findAll(@Session() session: UserSession) {
    return this.cartService.findAll(session?.user?.id);
  }

  @Patch('/increase')
  increaseQuantity(
    @Body() updateCartDto: UpdateCartDto,
    @Session() session: UserSession,
  ) {
    return this.cartService.increaseQuantity(updateCartDto, session?.user?.id);
  }

  @Patch('/decrease')
  decreaseQuantity(
    @Body() updateCartDto: UpdateCartDto,
    @Session() session: UserSession,
  ) {
    return this.cartService.decreaseQuantity(updateCartDto, session?.user?.id);
  }

  @Delete('/remove')
  remove(@Body() removeCartDto: CartDto, @Session() session: UserSession) {
    return this.cartService.removeFromCart(removeCartDto, session?.user?.id);
  }
}
