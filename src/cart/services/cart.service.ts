import { Injectable } from '@nestjs/common';
import { Cart, CartStatuses, CartItem } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private userCarts: Repository<Cart>,
    @InjectRepository(CartItem)
    private itemService: Repository<CartItem>,
  ) {}
  // private userCarts: Record<string, Cart> = {};

  findByUserId(userId: string): Promise<Cart | null> {
    return this.userCarts.findOneBy({ user_id: userId });
  }

  createByUserId(user_id: string): Promise<Cart> {
    const cart = this.userCarts.create({
      user_id,
      status: CartStatuses.OPEN,
    });
    const userCart = this.userCarts.save(cart);
    return userCart;
  }

  async findOrCreateByUserId(userId: string) {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    payload: PutCartPayload,
  ): Promise<CartItem | null> {
    const userCart = await this.findOrCreateByUserId(userId);
    const cartId = userCart.id;

    const existingItem = await this.itemService.findOneBy({
      cart_id: cartId,
      product_id: payload.product.id,
    });

    if (payload.count === 0) {
      if (existingItem) {
        await this.itemService.delete({
          cart_id: cartId,
          product_id: payload.product.id,
        });
      }
      return null;
    }

    if (!existingItem) {
      const newItem = this.itemService.create({
        cart_id: cartId,
        product_id: payload.product.id,
        count: payload.count,
        price: payload.product.price,
      });
      return await this.itemService.save(newItem);
    }
    await this.itemService.update(
      {
        cart_id: cartId,
        product_id: payload.product.id,
      },
      { count: payload.count, price: payload.product.price },
    );

    return await this.itemService.findOneBy({
      cart_id: cartId,
      product_id: payload.product.id,
    });
  }

  removeByUserId(userId): void {
    this.userCarts.delete({ user_id: userId });
  }

  getItemsByCartId(cartId: string): Promise<CartItem[]> {
    return this.itemService.findBy({ cart_id: cartId });
  }

  countOfItems(cartId: string): Promise<number> {
    return this.itemService.countBy({ cart_id: cartId });
  }
}
