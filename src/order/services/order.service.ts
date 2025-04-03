import { Injectable } from '@nestjs/common';
import { Order } from '../models';
import { CreateOrderPayload, OrderStatus } from '../type';
import { Repository } from 'typeorm';
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
    const order = {
      user_id: data.cartId,
      status: OrderStatus.Open,
      cart_id: data.cartId,
      total: data.total,
      payment: data.payment,
      delivery: data.delivery,
      comments: data.comments,
    };
    const result = await this.orderService.save(order);

    return result;
  }

  // TODO add  type
  async update(orderId: string, data: Order) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    await this.orderService.update(orderId, data);
  }
}
