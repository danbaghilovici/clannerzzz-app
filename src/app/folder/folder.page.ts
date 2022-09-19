import {Component, OnInit} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {ActivatedRoute} from '@angular/router';
// import { FileEntry} from '@awesome-cordova-plugins/file/ngx';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, from, Observable} from 'rxjs';
// import {getDownloadURL} from "@angular/fire/storage";
// import {firebaseApp$} from "@angular/fire/app";
import Reference from 'firebase/compat/index';
import {Directory, FileInfo, Filesystem, ReaddirResult, WriteFileResult} from '@capacitor/filesystem';

import {switchMap} from 'rxjs/operators';
// import {NativeAudio} from '@ionic-native/native-audio/ngx';
import {File, FileEntry} from '@awesome-cordova-plugins/file/ngx';
import {Media, MediaObject} from '@awesome-cordova-plugins/media/ngx';


// @ts-ignore
interface AudioFile {
  // @ts-ignore
  remoteRef: Reference;
  localRef?: FileEntry;
  isDownloading: boolean;
}


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static FIREBASE_FOLDER_AUDIOS = 'audios';
  public folder: string;
  public fileDir = 'podcast';
  // controls loading state of UI
  public loadingAudioFiles: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public availableAudioFiles: BehaviorSubject<AudioFile[]> = new BehaviorSubject([]);


  constructor(private http: HttpClient,
              private activatedRoute: ActivatedRoute,
              private fbStorage: AngularFireStorage,
              private platform: Platform,
              private media: Media,
              private file: File) {
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.platform.ready().then(() => {
      console.log('platform ready');
      this.getAvailableAudios().subscribe(() => {
        console.log('gata', this.availableAudioFiles.getValue());
      }, (err) => {
        console.error('err', err);
      });

      // // @ts-ignore
      // let items: Reference = null;
      // // @ts-ignore
      // ref.list()
      //   .pipe(switchMap((value, index) => {
      //     console.log('received list', value);
      //     // @ts-ignore
      //     items = value.items.pop();
      //     return from(items.getDownloadURL());
      //   }))
      //   .pipe(switchMap((links) => this.getBlob(links)))
      //   .pipe(switchMap((b) => this.writeAudioFileCordova(items.name, b)))
      //   .subscribe(() => {
      //   }, (err) => {
      //     console.log('erroare');
      //     console.error(err);
      //   }, () => {
      //     this.readFilesDirCordova();
      //   });
    });


  }

  public onAudioClick(file) {
    console.log('clicked', file);
    try {
      const audio: MediaObject = this.media.create(file.fullPath);
      audio.play();
    } catch (err) {
      console.error(err);
    }

  }

  public writeAudioFileCordova(name, datas: Blob): Observable<FileEntry> {
    return from(this.file.writeFile(this.file.cacheDirectory, name, datas, {replace: true}));
  }

  // public readFilesDirCordova(): void {
  //   console.log('reading dir');
  //   this.file.listDir(this.file.cacheDirectory, '').then((resp: FileEntry[]) => {
  //     console.log(resp);
  //     this.availableAudioFiles.next(resp);
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // }


  public getBlob(src: any): Observable<Blob> {
    console.log('received link');
    return this.http.get(src,
      {
        responseType: 'blob',
      });
  }

  private getAvailableAudios(): Observable<void> {
    const fbStorageRef = this.fbStorage.ref(FolderPage.FIREBASE_FOLDER_AUDIOS);
    // @ts-ignore
    return fbStorageRef.list().pipe(switchMap((value, index) => {
      console.log('received list', value);
      const res: AudioFile[] = [];
      for (const item of value.items) {
        console.log(item);
        const newAudioItem: AudioFile = {remoteRef: item, localRef: null, isDownloading: false};
        res.push(newAudioItem);
      }
      this.availableAudioFiles.next(res);
      console.log('set data', this.availableAudioFiles.getValue());
    }));
  }

  private onDownloadAudioFileClicked(file: AudioFile) {
    if (!file.remoteRef) {
      //err
      return null;
    }
    if (file.isDownloading){
      //err
      return null;
    }
    file.isDownloading = true;
    this.getBlob(file.remoteRef.getDownloadURL())
      .pipe(switchMap((value) => this.writeAudioFileCordova(file.remoteRef.name, value)))
      .subscribe()
  }

  private setAudioFileLocalSrc(file: AudioFile) {

  }
}
