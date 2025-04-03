import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

export enum CartStatuses {
  OPEN = 'OPEN',
  STATUS = 'STATUS',
}

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

@Entity('cart-items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  cart_id: string;
  @Column()
  product_id: string;
  @Column()
  count: number;
  @Column()
  price: number;
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  status: CartStatuses;
}