import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KenteCircleComponent } from './kente-circle.component';

describe('KenteCircleComponent', () => {
  let component: KenteCircleComponent;
  let fixture: ComponentFixture<KenteCircleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KenteCircleComponent]
    });
    fixture = TestBed.createComponent(KenteCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
