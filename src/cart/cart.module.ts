import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem, Product } from './models';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forFeature([Cart]),
    TypeOrmModule.forFeature([CartItem]),
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
