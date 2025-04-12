import {
  IsArray,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export enum OrderStatus {
  Open = 'OPEN',
  Approved = 'APPROVED',
  Confirmed = 'CONFIRMED',
  Sent = 'SENT',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}
export class Address {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  comment: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsArray()
  items: Array<{ productId: string; count: 1 }>;

  @ValidateNested()
  @IsObject()
  address: Address;
}

class Product {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
}

export class PutCartPayload {
  @IsNotEmpty()
  @ValidateNested()
  product: Product;
  @IsNumber()
  count: number;
};
export class CreateOrderPayload {
  @IsOptional()
  @IsUUID()
  id?: string;
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @IsUUID()
  @IsNotEmpty()
  cartId: string;
  @IsNumber()
  @IsNotEmpty()
  total: number;
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
  @IsNotEmpty()
  @IsJSON()
  payment: JSON;
  @IsNotEmpty()
  @IsJSON()
  delivery: JSON;
  @IsNotEmpty()
  comments: string;
}
