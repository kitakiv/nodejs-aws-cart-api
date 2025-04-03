import { OrderStatus } from '../type';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  total: number;
  @Column()
  user_id: string;
  @Column()
  status: OrderStatus;
  @Column()
  cart_id: string;
  @Column('json')
  payment: Record<string, any>;
  @Column('json')
  delivery: Record<string, any>;
  @Column('json')
  comment: Record<string, any>;
};
