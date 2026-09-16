import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderManage } from './order-manage';

describe('OrderManage', () => {
  let component: OrderManage;
  let fixture: ComponentFixture<OrderManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManage],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
