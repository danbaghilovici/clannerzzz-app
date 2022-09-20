import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';
import { AngularFireStorageModule , BUCKET} from '@angular/fire/compat/storage';
import { FolderPage } from './folder.page';
import { HttpClientModule} from '@angular/common/http';
// import {NativeAudio} from '@ionic-native/native-audio/ngx';
import {File} from '@awesome-cordova-plugins/file/ngx';
import {Media} from '@awesome-cordova-plugins/media/ngx';



@NgModule({
  providers:[
    { provide: BUCKET, useValue: 'clannerzzz.appspot.com' },
    // HTTP,
    File,
    // NativeAudio
    Media
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule,
    AngularFireStorageModule
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
