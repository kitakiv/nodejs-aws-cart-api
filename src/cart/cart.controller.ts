import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { Cart, CartItem } from './models';
import { CreateOrderDto, OrderStatus, PutCartPayload } from 'src/order/type';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(
    @Req() req: AppRequest,
  ): Promise<{ items: CartItem[]; cart: Cart }> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );
    const allItems = await this.cartService.getItemsByCartId(cart.id);
    return { cart, items: allItems };
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem> {
    // TODO: validate body payload...
    const item = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );
    return item;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);
    const numberOfItems = await this.cartService.countOfItems(cart.id);
    const items = await this.cartService.getItemsByCartId(cart.id);
    if (!(cart && numberOfItems)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId } = cart;
    const total = calculateCartTotal(items);
    const order = this.orderService.create({
      userId,
      cartId,
      total,
      comments: body.address.comment,
      status: OrderStatus.Open,
      payment: JSON.stringify({}) as unknown as JSON,
      delivery: JSON.stringify(body.address) as unknown as JSON,
    });
    this.cartService.removeByUserId(userId);

    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  getOrder(): Promise<Order[]> {
    return this.orderService.getAll();
  }
}
