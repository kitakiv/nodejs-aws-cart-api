import { Injectable } from '@nestjs/common';
import { Order } from '../models';
import { CreateOrderPayload, OrderStatus } from '../type';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderService: Repository<Order>,
  ) {}
  getAll(): Promise<Order[]> {
    return this.orderService.find();
  }

  findById(orderId: string): Promise<Order> {
    return this.orderService.findOneBy({ id: orderId });
  }

  async create(data: CreateOrderPayload): Promise<Order> {
    const order = await this.orderService.findOneBy({ id: data.id });
    const orderInfo = this.orderService.create({
      userId: data.userId,
      cartId: data.cartId,
      payment: data.payment || {},
      delivery: data.delivery,
      comments: data.comments,
      status: OrderStatus.Open,
      total: data.total,
    });
    if (order) {
      const updatedOrder = await this.orderService.update(data.id, orderInfo);
      return updatedOrder.raw;
    } else {
      const result = await this.orderService.save(order);

      return result;
    }

  }

  // TODO add  type
  async update(orderId: string, data: Order): Promise<UpdateResult> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    return await this.orderService.update(orderId, data);
  }
}
