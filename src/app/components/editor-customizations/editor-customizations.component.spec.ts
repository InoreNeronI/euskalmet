import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorCustomizationsComponent } from './editor-customizations.component';

describe('EditorCustomizationsComponent', () => {
  let component: EditorCustomizationsComponent;
  let fixture: ComponentFixture<EditorCustomizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorCustomizationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorCustomizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
