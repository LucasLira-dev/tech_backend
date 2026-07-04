import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
