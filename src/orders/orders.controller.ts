import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateOrderDto } from './dto/update-order.dto';

@UseGuards(AdminGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() { status }: UpdateOrderDto) {
    return this.ordersService.updateStatus(id, status);
  }
}
