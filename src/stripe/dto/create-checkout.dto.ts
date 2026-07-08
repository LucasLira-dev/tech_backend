import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @IsString({ message: 'ProductId must be a string' })
  @IsNotEmpty({ message: 'ProductId cannot be empty' })
  productId!: string;

  @Min(1, { message: 'Quantity must be at least 1' })
  quantity!: number;
}

export class CreateCheckoutDto {
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
