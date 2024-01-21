import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorScriptsComponent } from './editor-scripts.component';

describe('EditorScriptsComponent', () => {
  let component: EditorScriptsComponent;
  let fixture: ComponentFixture<EditorScriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorScriptsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
