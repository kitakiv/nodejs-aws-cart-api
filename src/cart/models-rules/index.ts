import { CartItem } from '../models';

export function calculateCartTotal(items: CartItem[]): number {
  return items.length
    ? items.reduce((acc: number, { price, count }: CartItem) => {
        return (acc += (+price || 0) * count);
      }, 0)
    : 0;
}
