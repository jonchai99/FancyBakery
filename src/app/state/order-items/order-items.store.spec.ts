import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpectatorService, createServiceFactory, SpyObject } from '@ngneat/spectator';
import { createProduct, ProductsQuery } from '../products';
import { OrderItemsStore } from './order-items.store';

describe('OrderItemsStore', () => {
  let spectator: SpectatorService<OrderItemsStore>;
  let productsQuery: SpyObject<ProductsQuery>;

  const createService = createServiceFactory({
    service: OrderItemsStore,
    imports: [HttpClientTestingModule],
    mocks: [ProductsQuery],
  });

  beforeEach(() => {
    spectator = createService();
    productsQuery = spectator.inject(ProductsQuery);
  });

  it('should be created', () => {
    expect(spectator.service).toBeDefined();
  });

  it('should properly determine MB11 packaging divisions', () => {
    const mockProduct = createProduct({
      code: 'MB11',
      packs: [
        { unitQuantity: 2, unitPrice: 9.95 },
        { unitQuantity: 5, unitPrice: 16.95 },
        { unitQuantity: 8, unitPrice: 24.95 },
      ],
    });
    productsQuery.getEntity.andReturn(mockProduct);
    const result = spectator.service.determineDivision(mockProduct, 14);

    expect(result).toBeTruthy();
    expect(result.length).toEqual(2);

    const expectedResult = [
      {
        description: '1 x 8 $24.95',
        total: 24.95,
      },
      { description: '3 x 2 $9.95', total: 29.85 },
    ];
    expect(result).toEqual(expectedResult);
  });

  it('should throw error', () => {
    const mockProduct = createProduct({
      code: 'TEST',
      packs: [
        { unitQuantity: 2, unitPrice: 9.95 },
        { unitQuantity: 5, unitPrice: 16.95 },
        { unitQuantity: 8, unitPrice: 24.95 },
      ],
    });
    productsQuery.getEntity.andReturn(mockProduct);

    expect(() => spectator.service.determineDivision(mockProduct, 23)).toThrow();
  });

  it('should properly determine VS5 packaging divisions', () => {
    const mockProduct = createProduct({
      code: 'VS5',
      packs: [
        { unitQuantity: 3, unitPrice: 6.99 },
        { unitQuantity: 5, unitPrice: 8.99 },
      ],
    });
    productsQuery.getEntity.andReturn(mockProduct);
    const result = spectator.service.determineDivision(mockProduct, 10);

    expect(result).toBeTruthy();
    expect(result.length).toEqual(1);

    const expectedResult = [
      {
        description: '2 x 5 $8.99',
        total: 17.98,
      },
    ];
    expect(result).toEqual(expectedResult);
  });

  it('should properly determine CF packaging divisions', () => {
    const mockProduct = createProduct({
      code: 'CF',
      packs: [
        { unitQuantity: 3, unitPrice: 5.95 },
        { unitQuantity: 5, unitPrice: 9.95 },
        { unitQuantity: 9, unitPrice: 16.99 },
      ],
    });
    productsQuery.getEntity.andReturn(mockProduct);
    const result = spectator.service.determineDivision(mockProduct, 13);

    expect(result).toBeTruthy();
    expect(result.length).toEqual(2);

    const expectedResult = [
      {
        description: '2 x 5 $9.95',
        total: 19.9,
      },
      { description: '1 x 3 $5.95', total: 5.95 },
    ];
    expect(result).toEqual(expectedResult);
  });
});
