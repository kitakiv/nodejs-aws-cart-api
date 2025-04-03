import { CartItem } from '../models';

export function calculateCartTotal(items: CartItem[]): number {
  return items.length
    ? items.reduce((acc: number, { price, count }: CartItem) => {
        return (acc += price * count);
      }, 0)
    : 0;
}
