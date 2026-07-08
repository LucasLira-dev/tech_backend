<div align="center">

# 🛒 Stripe Integration — To-Do

</div>

---

## 1. Schema Prisma

Adicione `stripeSessionId` e `stripePaymentIntentId` no model `Order`:

```prisma
model Order {
  id                    String      @id @default(uuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  status                String      @default("pending")
  total                 Decimal     @db.Decimal(10, 2)
  stripePaymentIntentId String?     @unique
  stripeSessionId       String?     @unique
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  items                 OrderItem[]

  @@index([userId])
  @@map("order")
}
```

```bash
npx prisma migrate dev --name add_stripe_fields
```

---

## 2. `.env.example`

Adicione no final:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=brl
```

---

## 3. `src/stripe/dto/create-checkout.dto.ts`

```ts
import { IsArray, IsNotEmpty, IsString, Min } from 'class-validator';

class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @Min(1)
  quantity: number;
}

export class CreateCheckoutDto {
  @IsArray()
  items: CheckoutItemDto[];
}
```

---

## 4. `src/stripe/stripe.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import 'dotenv/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-03-31',
    });
  }

  async createCheckoutSession(
    orderId: string,
    items: { name: string; price: number; quantity: number }[],
  ) {
    const session = await this.stripe.checkout.sessions.create({
      metadata: { orderId },
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders/${orderId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
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

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
```

---

## 5. `src/stripe/stripe.controller.ts`

```ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('checkout')
  async checkout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Session() session: UserSession,
  ) {
    const userId = session?.user?.id;

    const productIds = createCheckoutDto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of createCheckoutDto.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity)
        throw new Error(`Insufficient stock for ${product.name}`);
    }

    const total = createCheckoutDto.items.reduce((acc, item) => {
      const product = productMap.get(item.productId)!;
      return acc + Number(product.price) * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        items: {
          create: createCheckoutDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.price,
          })),
        },
      },
    });

    const lineItems = createCheckoutDto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        name: product.name,
        price: Number(product.price),
        quantity: item.quantity,
      };
    });

    return this.stripeService.createCheckoutSession(order.id, lineItems);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody!,
      signature,
    );

    switch (event.type) {
      case 'checkout.session.completed': {
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

            await this.prisma.cartItem.deleteMany({
              where: { userId: order.userId },
            });
          }
        }
        break;
      }

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
}
```

---

## 6. `src/stripe/stripe.module.ts`

```ts
import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from 'prisma.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService, PrismaService],
})
export class StripeModule {}
```

---

## 7. `src/main.ts` — Raw body pro webhook

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

---

## 8. `src/app.module.ts` — Importe o StripeModule

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishListModule } from './wish-list/wish-list.module';
import { CategoriesModule } from './categories/categories.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ProductsModule,
    CartModule,
    WishListModule,
    CategoriesModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 9. Instalar dependência

```bash
npm install stripe
```

---

## 10. Stripe webhook local (testes)

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

Copie o `whsec_...` gerado e cole no `STRIPE_WEBHOOK_SECRET` do `.env`.

---

### Fluxo final

```
POST /stripe/checkout
       ↓
  Cria Order (pending) + sessão Stripe
       ↓
  Redireciona pro link do Stripe
       ↓
  Usuário paga
       ↓
  Stripe → POST /stripe/webhook
       ↓
  Order → "paid" | Estoque diminui | Carrinho limpo
```
