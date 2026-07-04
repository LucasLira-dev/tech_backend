import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  @IsString({ message: 'O nome do produto deve ser uma string' })
  name!: string;

  @IsNotEmpty({ message: 'O slug do produto é obrigatório' })
  @IsString({ message: 'O slug do produto deve ser uma string' })
  slug!: string;

  @IsNotEmpty({ message: 'A descrição do produto é obrigatória' })
  @IsString({ message: 'A descrição do produto deve ser uma string' })
  description!: string;

  @IsNotEmpty({ message: 'O preço do produto é obrigatório' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'O preço do produto deve ser um número' },
  )
  price!: number;

  @IsNotEmpty({ message: 'O estoque do produto é obrigatório' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'O estoque do produto deve ser um número' },
  )
  stock!: number;

  @IsNotEmpty({ message: 'A categoria do produto é obrigatória' })
  @IsString({ message: 'A categoria do produto deve ser uma string' })
  categoryId!: string;

  @IsNotEmpty({ message: 'As imagens do produto são obrigatórias' })
  @IsArray({ message: 'As imagens devem ser um array' })
  @ArrayMinSize(1, { message: 'Pelo menos uma imagem é obrigatória' })
  @IsString({ each: true, message: 'Cada imagem deve ser uma string' })
  images!: string[];
}
