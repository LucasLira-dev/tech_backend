import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async checkout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Session() session: UserSession,
  ) {
    return this.stripeService.createCheckout(
      session.user.id,
      createCheckoutDto.items,
    );
  }

  @AllowAnonymous()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }
    return this.stripeService.constructWebhook(req.body as Buffer, signature);
  }
}
