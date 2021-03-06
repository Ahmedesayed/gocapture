import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {Documents} from "./documents";
import {Document} from "../../components/document";
import {IonicImageLoader} from "ionic-image-loader";

@NgModule({
  declarations: [
    Documents,
    Document
  ],
  imports: [
    IonicPageModule.forChild(Documents),
    IonicImageLoader
  ],
})
export class DocumentsPageModule {}
