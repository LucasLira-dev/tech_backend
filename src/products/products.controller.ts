import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AdminGuard)
  @Post('/create')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @AllowAnonymous()
  findAll(@Session() session: UserSession) {
    return this.productsService.findAll(session?.user?.id);
  }

  @Get(':id')
  findOne(@Session() session: UserSession, @Param('id') id: string) {
    return this.productsService.findOne(id, session?.user?.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
