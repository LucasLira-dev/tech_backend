import { IsIn } from 'class-validator';

type StatusType = 'pending' | 'paid' | 'cancelled';

export class UpdateOrderDto {
  @IsIn(['pending', 'paid', 'cancelled'])
  status!: StatusType;
}
