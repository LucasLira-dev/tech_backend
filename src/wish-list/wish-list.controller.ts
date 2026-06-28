import { Controller, Post, Body, Get } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListDto } from './dto/wish-list.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('wish-list')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @Get()
  getWishList(@Session() session: UserSession) {
    return this.wishListService.getWishList(session?.user.id);
  }

  @Post('/toggle')
  create(@Body() wishListDto: WishListDto, @Session() session: UserSession) {
    return this.wishListService.toogle(wishListDto.productId, session?.user.id);
  }
}
