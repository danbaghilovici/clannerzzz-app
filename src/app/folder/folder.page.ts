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


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public fileDir = 'podcast';

  public files: BehaviorSubject<FileEntry[]> = new BehaviorSubject([]);


  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private fbStorage: AngularFireStorage,
              private platform: Platform, private media: Media, private file: File) {
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.platform.ready().then(() => {
      // this.readFilesDir();
      console.log('platform ready');
      // const downloadPath = (
      //   this.platform.is('android')
      // ) ? this.file.externalDataDirectory : this.file.documentsDirectory;
      // console.log('download path is', downloadPath + '');

      // console.log(this.fbStorage);

      const ref = this.fbStorage.ref('');
      // ref.list().subscribe((res) => {
      //   // @ts-ignore
      //   const item: Reference = res.items.pop();
      //   item.getDownloadURL().then(link => {
      //     console.log(link);
      //
      //   });
      //
      // });
      // @ts-ignore
      let items: Reference = null;
      // @ts-ignore
      ref.list()
        .pipe(switchMap((value, index) => {
          console.log('received list', value);
          // @ts-ignore
          items = value.items.pop();
          return from(items.getDownloadURL());
        }))
        .pipe(switchMap((links) => this.getBlob(links)))
        .pipe(switchMap((b) => this.writeAudioFileCordova(items.name, b)))
        .subscribe(() => {
        }, (err) => {
          console.log('erroare');
          console.error(err);
        }, () => {
          this.readFilesDirCordova();
        });
    });


  }

  public onAudioClick(file) {
    console.log('clicked', file);
    try {
      const audio: MediaObject = this.media.create(file.fullPath);
      audio.play();
    }catch (err){
      console.error(err);
    }
    // this.audio2.preloadSimple('audio', file.nativeURL).then(() => {
    //   this.audio2.play('audio').then((res) => {
    //     console.log('played ', res);
    //   }).catch(err => {
    //     console.error(err);
    //   });
    // }).catch(err=>{
    //   console.error('error on preload', err);
    // });
    // this.audio2.preload({assetId: 'audio', assetPath: file.nativeURL, audioChannelNum: 1, isUrl: true})
    //   .then(() => {
    //     this.audio2.play({assetId: 'audio'});
    //   }).catch((err) => {
    //   console.error(err);
    // });
  }


  public readFilesDir(): void {
    // console.log('reading dir');
    // this.file.listDir(this.file.externalDataDirectory, '').then((resp: FileEntry[]) => {
    //   console.log(resp);
    //   this.files.next(resp);
    // }).catch(err => {
    //   console.error(err);
    // });
    // Filesystem.readdir({path: '', directory: Directory.Data}).then((res) => {
    //   console.log('data',res);
    //   // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //   this.files.next([res.files.filter(value => value.name==='test.ogg').pop()]);
    // });
  }

  public async writeAudioFile(name, datas: Blob): Promise<Observable<WriteFileResult>> {
    console.log('received blob', datas, name);
    // return from(this.file.writeFile(downloadPath, name, data, {replace: true}));

    return from(Filesystem.writeFile({path: 'test.ogg', data: (await datas.text()), directory: Directory.Data,}));
  }

  public writeAudioFileCordova(name, datas: Blob): Observable<any> {
    return from(this.file.writeFile(this.file.cacheDirectory, 'text.ogg', datas, {replace: true}));
  }

  public readFilesDirCordova(): void {
    console.log('reading dir');
    this.file.listDir(this.file.cacheDirectory, '').then((resp: FileEntry[]) => {
      console.log(resp);
      this.files.next(resp);
    }).catch(err => {
      console.error(err);
    });
    // Filesystem.readdir({path: '', directory: Directory.Data}).then((res) => {
    //   console.log('data',res);
    //   // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //   this.files.next([res.files.filter(value => value.name==='test.ogg').pop()]);
    // });
  }


  public getBlob(src: any): Observable<Blob> {
    console.log('received link');
    return this.http.get(src,
      {
        responseType: 'blob',
      });
  }
}
