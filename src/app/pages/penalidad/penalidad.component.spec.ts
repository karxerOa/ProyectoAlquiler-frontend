import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PenalidadComponent } from './penalidad.component';

describe('PenalidadComponent', () => {
  let component: PenalidadComponent;
  let fixture: ComponentFixture<PenalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenalidadComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PenalidadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
