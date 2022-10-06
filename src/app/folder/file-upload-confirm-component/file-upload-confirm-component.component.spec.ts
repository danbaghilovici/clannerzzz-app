import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FileUploadConfirmComponentComponent } from './file-upload-confirm-component.component';

describe('FileUploadConfirmComponentComponent', () => {
  let component: FileUploadConfirmComponentComponent;
  let fixture: ComponentFixture<FileUploadConfirmComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadConfirmComponentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadConfirmComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
