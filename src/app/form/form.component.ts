import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs/operators';
import { createOrderItem, OrderItem } from '../state/order-items';
import { findMinQuantity, Product, ProductsQuery, ProductsService } from '../state/products';

@UntilDestroy()
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @Output() orderItemAdd = new EventEmitter<OrderItem>();

  products$ = this.productsQuery.selectAll();

  productMinQuantity = 0;
  form = this.formBuilder.group({
    productCode: [null, Validators.required],
    quantity: [null, Validators.required],
  });

  private readonly initialFormValue = this.form.value;

  constructor(private formBuilder: FormBuilder, private productsQuery: ProductsQuery, private productsService: ProductsService) {}

  ngOnInit(): void {
    this.productCode.valueChanges
      .pipe(
        tap((x) => {
          const product = this.productsQuery.getEntity(x);
          this.productMinQuantity = findMinQuantity(product);
          this.quantity.setValidators([Validators.required, Validators.min(this.productMinQuantity), ValidateQuantity(product)]);
          this.quantity.updateValueAndValidity();
        }),
        untilDestroyed(this)
      )
      .subscribe();

    this.productsService.fetch().pipe(untilDestroyed(this)).subscribe();
  }

  add(): void {
    this.orderItemAdd.emit(
      createOrderItem({
        quantity: this.quantity.value,
        productCode: this.productCode.value,
      })
    );

    this.form.reset(this.initialFormValue, { emitEvent: false });
  }

  get quantity(): FormControl {
    return this.form.get('quantity') as FormControl;
  }

  get productCode(): FormControl {
    return this.form.get('productCode') as FormControl;
  }
}

export function ValidateQuantity(product: Product): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    if (!control.value || !product) {
      return null;
    }

    if (product.packs.every(x => control.value % x.unitQuantity > 0)) {
      return { noQuantityDivisible: true };
    }

    return null;
  };
}
