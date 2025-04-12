import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { Order } from './models';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
