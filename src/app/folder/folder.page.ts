import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute } from '@angular/router';
import {Directory, Encoding, Filesystem} from '@capacitor/filesystem';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;

  constructor(private activatedRoute: ActivatedRoute,private fbStorage: AngularFireStorage) {
  }

  ngOnInit() {
    // console.log(this.fbStorage);
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    const ref = this.fbStorage.ref('');
    ref.list().subscribe((res)=>{
      res.items.pop().getDownloadURL().then(link=>{
        console.log(link);
        const writeSecretFile = async () => {
          const x= await Filesystem.writeFile({
            path: 'secrets/text.txt',
            data: 'This is a test',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          console.log(x);
        };
      });
    });
  }

}
