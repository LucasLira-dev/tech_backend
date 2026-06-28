import { Module } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import { PrismaService } from 'prisma.service';

@Module({
  controllers: [WishListController],
  providers: [WishListService, PrismaService],
})
export class WishListModule {}
