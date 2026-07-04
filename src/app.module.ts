import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishListModule } from './wish-list/wish-list.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ProductsModule,
    CartModule,
    WishListModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
