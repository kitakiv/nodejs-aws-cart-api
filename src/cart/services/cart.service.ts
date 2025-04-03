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

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);
    const updatedTime = Date.now();

    const cartIndex = userCart.id;
    const productItem = await this.itemService.findOneBy({
      cart_id: cartIndex,
      product_id: payload.product.id,
    })
    if (!productItem) {
      const item = this.itemService.create({
        cart_id: cartIndex,
        product_id: payload.product.id,
        count: payload.count,
        price: payload.product.price
      })
      await this.itemService.save(item);
    } else if (payload.count === 0 && productItem) {
      await this.itemService.remove(productItem);
    } else {
      await this.itemService.update(productItem, {
        count: payload.count,
      });
    }

    return userCart;
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
