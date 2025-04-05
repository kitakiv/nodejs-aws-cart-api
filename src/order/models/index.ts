import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatus } from '../type';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'cart_id' })
  cartId: string;

  @Column('jsonb')
  payment: Record<string, any>;

  @Column('jsonb')
  delivery: Record<string, any>;

  @Column('text', { nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    name: 'status'
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}
