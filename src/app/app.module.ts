import { NgModule } from '@angular/core';
import {BrowserModule, SafeHtml} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyApp } from './app.component';
import { Login, UrlChoose } from "../views/login";
import { Main } from "../views/main";
import { Dashboard } from "../views/dashboard";
import { Forms } from "../views/forms";
import { Dispatches } from "../views/dispatches";
import { Settings } from "../views/settings";
import { LogView } from "../views/log";
import { FormSummary } from "../views/form-summary";
import { FormReview } from "../views/form-review";
import { FormCapture } from "../views/form-capture";
import { FormInstructions } from "../views/form-instructions";
import { RESTClient} from "../services/rest-client";
import { DBClient } from "../services/db-client";
import { PushClient } from "../services/push-client";
import { SyncClient } from "../services/sync-client";
import { LogClient } from "../services/log-client";
import { BussinessClient } from "../services/business-service";
import { ImageProcessor } from "../services/image-processor";
import { IonPullUpComponent } from '../components/ion-pullup';
import { OcrSelector } from "../components/ocr-selector";
import { FormView, FormSelectionView } from '../components/form-view';
import { BusinessCard, Image, SimpleName, Signature, SignatureModal, SignaturePad, Gps, Address, Checkboxes, Radios, Dropdown, Barcoder, ImageViewer} from "../components/form-view/elements";
import { ArrayFilterPipe } from '../pipes/filter-pipe';
import { FormControlPipe } from '../pipes/form-control-pipe';
import {ProspectSearch} from "../views/prospect-search";
import { TextMaskModule } from 'angular2-text-mask';
//import { CustomFormsModule } from 'ng2-validation';
import { Http, HttpModule, RequestOptions, XHRBackend } from '@angular/http';
import { HttpService } from '../util/http';
import { MyCurrencyDirective } from "../util/currency";
import { Transfer } from '@ionic-native/transfer';
import { File } from '@ionic-native/file';
import { Device } from "@ionic-native/device";
import { Push } from '@ionic-native/push';
import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
import { SQLite } from '@ionic-native/sqlite';
import { Clipboard } from '@ionic-native/clipboard';
import { AppVersion } from '@ionic-native/app-version';
import { Geolocation } from "@ionic-native/geolocation";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { IonicImageViewerModule } from 'ionic-img-viewer';
import { StatusBar } from "@ionic-native/status-bar";
import { Popup } from '../providers/popup/popup';
import { IonicApp } from 'ionic-angular/components/app/app-root';
import { IonicModule } from 'ionic-angular/module';
import { Util } from "../util/util";
import {AvatarPathUpdaterPipe} from "../pipes/avatar-path-updater";
import {DynamicFormElementComponent} from "../components/form-view/dynamic-form-element/dynamic-form-element";
import {CameraPreview} from "@ionic-native/camera-preview";
import {HTMLBlock} from "../components/form-view/elements/html-block";
import {SafeHtmlPipe} from "../pipes/save-html/safe-html";
import {HTTP} from "@ionic-native/http";
import { ThemeProvider } from '../providers/theme/theme';
import {BusinessCardOverlayPage} from "../views/business-card-overlay/business-card-overlay";

import {SubmissionStatusPipe} from "../pipes/submission-status/submission-status";
import {LocalStorageProvider} from "../providers/local-storage/local-storage";

@NgModule({
  declarations: [
    MyApp,
    Login,
    Main,
    Dashboard,
    Forms,
    Dispatches,
    Settings,
    IonPullUpComponent,
    FormSummary,
    FormReview,
    FormCapture,
    FormInstructions,
    ArrayFilterPipe,
    SafeHtmlPipe,
    FormControlPipe,
    AvatarPathUpdaterPipe,
    SubmissionStatusPipe,
    FormView,
    LogView,
    SignaturePad,
    FormSelectionView,
    BusinessCard, Image, SimpleName, Signature, SignatureModal, Gps, Address, Checkboxes, Radios, Dropdown, Barcoder, HTMLBlock, ImageViewer, UrlChoose,
    ProspectSearch,
    OcrSelector,
    MyCurrencyDirective,
    DynamicFormElementComponent,
    BusinessCardOverlayPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicImageViewerModule,
    TextMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Login,
    Main,
    Dashboard,
    Forms,
    Dispatches,
    Settings,
    IonPullUpComponent,
    FormSummary,
    FormReview,
    FormCapture,
    FormInstructions,
    FormView,
    LogView,
    SignaturePad,
    FormSelectionView,
    BusinessCard, Image, SimpleName, Signature, SignatureModal, Gps, Address, Checkboxes, Radios, Dropdown, Barcoder, ImageViewer, UrlChoose,
    ProspectSearch,
    OcrSelector,
    BusinessCardOverlayPage
  ],
  exports: [
    DynamicFormElementComponent
  ],
  providers: [
    DBClient,
    RESTClient,
    PushClient,
    SyncClient,
    LogClient,
    BussinessClient,
    ImageProcessor,
    Transfer,
    File,
    Device,
    HTTP,
    Push,
    Network,
    Camera,
    SQLite,
    Clipboard,
    AppVersion,
    Geolocation,
    BarcodeScanner,
    StatusBar,
    ScreenOrientation,
    CameraPreview,
    {
      provide: Http,
      useFactory: httpFactory,
      deps: [XHRBackend, RequestOptions]
    },
    Popup,
    Util,
    ThemeProvider,
    LocalStorageProvider
  ]
})
export class AppModule { }

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
}
