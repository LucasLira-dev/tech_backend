import { IsNotEmpty, IsString } from 'class-validator';

export class WishListDto {
  @IsString({ message: "O campo 'productId' deve ser uma string." })
  @IsNotEmpty({ message: "O campo 'productId' não pode estar vazio." })
  productId!: string;
}
