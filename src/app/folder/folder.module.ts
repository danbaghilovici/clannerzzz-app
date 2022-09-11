import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';
import { AngularFireStorageModule , BUCKET} from '@angular/fire/compat/storage';
import { FolderPage } from './folder.page';
import {getStorage, provideStorage} from '@angular/fire/storage';

@NgModule({
  providers:[
    { provide: BUCKET, useValue: 'clannerzzz.appspot.com' }
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    AngularFireStorageModule
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
