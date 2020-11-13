import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Product } from './product.model';
import { ProductsQuery } from './products.query';
import { ProductsStore } from './products.store';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly dataSource = '/assets/data-source/products.json';
  constructor(
    private productsStore: ProductsStore,
    private productsQuery: ProductsQuery,
    private http: HttpClient
  ) {}

  fetch(): Observable<Product[]> {
    const request = this.http
      .get<Product[]>(this.dataSource)
      .pipe(tap((entities) => this.productsStore.set(entities)));

    return this.productsQuery
      .selectHasCache()
      .pipe(switchMap((hasCache) => (hasCache ? of(null) : request)));
  }
}
