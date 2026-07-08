import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CheckoutItemDto } from './dto/create-checkout.dto';
import { PrismaService } from 'prisma.service';
import { Product } from '@prisma/client';

type ItemsType = {
  name: string;
  price: number;
  quantity: number;
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createCheckout(userId: string, items: CheckoutItemDto[]) {
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    this.validateStock(items, productMap);

    const totalAmount = this.calculateTotal(items, productMap);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total: totalAmount,
        status: 'pending',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
    });

    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
      };
    });

    return this.createCheckoutSession(order.id, lineItems);
  }

  async createCheckoutSession(orderId: string, items: ItemsType[]) {
    const session = await this.stripe.checkout.sessions.create({
      metadata: { orderId },
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders/${orderId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/orders/cancel`,
      line_items: items.map((item) => ({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'brl',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
    });
    return { sessionId: session.id, url: session.url };
  }

  async constructWebhook(payload: Buffer, signature: string) {
    const event = this.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object;
          const orderId = session.metadata?.orderId;
          if (orderId) {
            await this.prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'paid',
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
              },
            });

            const order = await this.prisma.order.findUnique({
              where: { id: orderId },
              include: { items: true },
            });

            if (order) {
              for (const item of order.items) {
                await this.prisma.product.update({
                  where: { id: item.productId },
                  data: { stock: { decrement: item.quantity } },
                });
              }
            }

            await this.prisma.cartItem.deleteMany({
              where: { userId: order?.userId },
            });
          }
        }
        break;

      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'cancelled' },
          });
        }
        break;
      }
    }

    return { received: true };
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  private validateStock(
    items: CheckoutItemDto[],
    productMap: Map<string, Product>,
  ) {
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }
      if (item.quantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  private calculateTotal(
    items: CheckoutItemDto[],
    productMap: Map<string, Product>,
  ) {
    return items.reduce((acc, item) => {
      const product = productMap.get(item.productId)!;
      return acc + Number(product.price) * item.quantity;
    }, 0);
  }
}
