import { ID } from '@datorama/akita';
import { ProductPack } from './product-pack.model';

export interface Product {
  code: ID;
  name: string;
  packs: ProductPack[];
}

export function createProduct(params: Partial<Product>): Product {
  return { ...params } as Product;
}

export function findMinQuantity(product: Product): number {
  if (!product) {
    return 0;
  }

  return Math.min(...product.packs.map((pack) => pack.unitQuantity));
}
