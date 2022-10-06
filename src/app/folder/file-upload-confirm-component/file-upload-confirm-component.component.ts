import {Component, Input, OnInit} from '@angular/core';
import {IonModal, ModalController} from '@ionic/angular';

@Component({
  selector: 'app-file-upload-confirm-component',
  templateUrl: './file-upload-confirm-component.component.html',
  styleUrls: ['./file-upload-confirm-component.component.scss'],
})
export class FileUploadConfirmComponentComponent implements OnInit {
  @Input() fileName: string;
  public fileLabel='';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.fileName);
  }

  cancel(){
    this.modalCtrl.dismiss(null,'CANCEL');

  }

  confirm(){
    this.modalCtrl.dismiss({name:this.fileName,label:this.fileLabel},'CONFIRM');
    // console.log(this.fileName,this.fileLabel);
  }

}
