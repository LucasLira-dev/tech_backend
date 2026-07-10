import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('myOrders')
  findMyOrders(@Session() session: UserSession) {
    return this.ordersService.findMyOrders(session.user.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() { status }: UpdateOrderDto) {
    return this.ordersService.updateStatus(id, status);
  }
}
