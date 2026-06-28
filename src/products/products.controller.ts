import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @AllowAnonymous()
  findAll(@Session() session: UserSession) {
    return this.productsService.findAll(session?.user?.id);
  }
}
