import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {ActivatedRoute} from '@angular/router';
// import { FileEntry} from '@awesome-cordova-plugins/file/ngx';
import {Platform} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, from, Observable, of, Subject, Subscription} from 'rxjs';
// import {getDownloadURL} from "@angular/fire/storage";
// import {firebaseApp$} from "@angular/fire/app";
import Reference from 'firebase/compat/index';

import {catchError, switchMap} from 'rxjs/operators';
// import {NativeAudio} from '@ionic-native/native-audio/ngx';
import {Entry, File, FileEntry} from '@awesome-cordova-plugins/file/ngx';
import {Media, MEDIA_STATUS, MediaObject} from '@awesome-cordova-plugins/media/ngx';
import {Share} from '@capacitor/share';

// @ts-ignore
interface AudioFile {
  // @ts-ignore
  remoteRef: Reference;
  localRef?: Entry;
  isDownloading: boolean;
  audioStatus$?: Observable<MEDIA_STATUS>;
  audioObject?: MediaObject;
  audioSub?: Subscription;
  audioIntStatus?: BehaviorSubject<MEDIA_STATUS>;
}


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  // this will also serve as the local dir name
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
              private file: File,
              private changeRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.platform.ready().then(() => {
      console.log('platform ready');
      this.getRemoteAvailableAudios()
        .pipe(switchMap(() => this.getLocalAvailableAudios()))
        .subscribe(value => {
          console.log('files ready', this.availableAudioFiles.getValue());
        }, (error) => {
          console.error(error);
        });

    });
  }


  public writeAudioFileCordova(name, datas: Blob): Observable<FileEntry> {
    console.log('received blob', name, datas);
    return from(this.file.writeFile(this.file.externalDataDirectory+'/'+FolderPage.FIREBASE_FOLDER_AUDIOS, name, datas, {replace: true}));
  }


  public getBlob(src: any): Observable<Blob> {
    console.log('received link', src);
    return this.http.get(src,
      {
        responseType: 'blob',
      });
  }

  private getRemoteAvailableAudios(): Observable<AudioFile[]> {
    const fbStorageRef = this.fbStorage.ref(FolderPage.FIREBASE_FOLDER_AUDIOS);
    // @ts-ignore
    return fbStorageRef.list().pipe(switchMap((value, index) => {
      console.log('received list', value);
      const res: AudioFile[] = [];
      for (const item of value.items) {
        console.log(item);
        const newAudioItem: AudioFile = {
          remoteRef: item,
          localRef: null,
          isDownloading: false,
          audioStatus$: null,
          audioObject: null,
          audioSub: null,
          audioIntStatus: new BehaviorSubject(MEDIA_STATUS.NONE)
        };
        res.push(newAudioItem);
      }
      this.availableAudioFiles.next(res);
      return of(res);
    }));
  }

  private getLocalAvailableAudios(): Observable<void> {
    return from(this.file.checkDir(this.file.externalDataDirectory,FolderPage.FIREBASE_FOLDER_AUDIOS))
      .pipe(catchError(err => of(false)))
      .pipe(switchMap((value)=> {
        console.log(value);
        return !value ? from(this.file.createDir(this.file.externalDataDirectory, FolderPage.FIREBASE_FOLDER_AUDIOS, true)) : of({});
      }))
      .pipe(switchMap((value)=> {
        console.log(value);
        return from(this.file.listDir(this.file.externalDataDirectory, FolderPage.FIREBASE_FOLDER_AUDIOS));
      }))
      .pipe(switchMap((value) => {
        console.log('local files', value);
        return this.setLocalAvailableAudios(value);
      })).pipe(catchError(err=>{
        console.log(err);
        return of();
      }));
  }

  private setLocalAvailableAudios(files: Entry[]): Observable<any> {
    for (const audioFile of this.availableAudioFiles.getValue()) {
      audioFile.localRef = files.filter(value => value.name === audioFile.remoteRef.name).pop() || null;
    }
    return of([]);
  }

  private onDownloadAudioFileClicked(file: AudioFile): Observable<any> {
    console.log('clicked', file);
    if (!file.remoteRef) {
      //err
      return null;
    }
    if (file.isDownloading) {
      //err
      return null;
    }
    console.log('starting');
    file.isDownloading = true;
    from(file.remoteRef.getDownloadURL()).pipe(switchMap((value) => {
      console.log(value);
      return this.getBlob(value);
    }))
      .pipe(switchMap((value) => this.writeAudioFileCordova(file.remoteRef.name, value)))
      .pipe(switchMap((value, index) => {
        console.log('file downloaded');
        return of(value);
      })).subscribe((value) => {
      console.log('ok');
      file.localRef = value;
      file.isDownloading = false;
    }, (error) => {
      console.log(error);
      file.localRef = null;
      file.isDownloading = false;
    });
  }


  private onPlayAudioFileClicked(file: AudioFile, index: number) {
    console.log(file);
    this.loadFile(file);
    file.audioIntStatus.next(2);
    file.audioObject.onSuccess.subscribe(suc => {
      console.log('suc', suc);
      file.audioIntStatus.next(4);
      console.log('suc', file.audioIntStatus.getValue());
    });
    file.audioObject.play();
    file.audioSub = file.audioStatus$.subscribe(status => {
      console.log('status', status);
      file.audioIntStatus.next(status);
      console.log(file.audioIntStatus.getValue() + '');
      // this.availableAudioFiles.getValue()[index].audioIntStatus.next(status);
      this.changeRef.detectChanges();

    }, (error) => {
      console.error('err');
    }, () => {
      console.log('ceva');
    });

    console.log('', file);

  }

  private loadFile(file: AudioFile) {
    if (file.audioObject === null) {
      file.audioObject = this.media.create(file.localRef.nativeURL);
    }
    if (file.audioStatus$ === null) {
      file.audioStatus$ = file.audioObject.onStatusUpdate;

    }
    console.log(file);

  }

  private releaseAudioFile(file: AudioFile) {
    file.audioObject.release();
    file.audioObject = null;
    file.audioSub.unsubscribe();
    file.audioStatus$ = null;
  }

  private getAudioFileStatus(file: AudioFile): MEDIA_STATUS {
    if (!file.audioObject) {
      return MEDIA_STATUS.NONE;
    }
    return file.audioIntStatus.getValue();
  }

  public onShare(selectedFile: AudioFile) {
    // this.file.read
    // from(this.file.copyFile(file.localRef.name, this.file.externalDataDirectory, file.localRef.name, this.file.externalCacheDirectory))
    return from(Share.share({
      title: 'See cool stuff',
      text: 'Reenviado desde la app de CLANNERZZZ',
      url: selectedFile.localRef.nativeURL,
      dialogTitle: 'Share with buddies',
    })).subscribe(data=>{
      console.log('asd');
    },(error)=>{
      console.error(error);
    });

  }


}
