import { NgModule } from '@angular/core';
import {BrowserModule, SafeHtml} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyApp } from './app.component';
import { Login, UrlChoose } from "../views/login";
import { Main } from "../views/main";
import { Dashboard } from "../views/dashboard";
import { Forms } from "../views/forms";
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
import { BusinessCard, Image, SimpleName, Signature, SignatureModal, SignaturePad, Gps, Address, Checkboxes, Radios, Dropdown, Badge, ImageViewer} from "../components/form-view/elements";
import {ProspectSearch} from "../views/prospect-search";
import { TextMaskModule } from 'angular2-text-mask';
//import { CustomFormsModule } from 'ng2-validation';
import { Http, HttpModule, RequestOptions, XHRBackend } from '@angular/http';
import { HttpService } from '../util/http';
import { MyCurrencyDirective } from "../util/currency";
import { FileTransfer } from '@ionic-native/file-transfer';
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
import {PhotoViewer} from "@ionic-native/photo-viewer";

import { IonicImageViewerModule } from 'ionic-img-viewer';
import { StatusBar } from "@ionic-native/status-bar";
import { Popup } from '../providers/popup/popup';
import { IonicApp } from 'ionic-angular/components/app/app-root';
import { IonicModule } from 'ionic-angular/module';
import { Util } from "../util/util";
import {DynamicFormElementComponent} from "../components/form-view/dynamic-form-element/dynamic-form-element";
import {HTMLBlock} from "../components/form-view/elements/html-block";
import {HTTP} from "@ionic-native/http";
import { ThemeProvider } from '../providers/theme/theme';
import { PipesModule } from '../pipes/pipes.module';
import { BusinessCardOverlayPageModule } from '../views/business-card-overlay/business-card-overlay.module';
import { LocalStorageProvider } from '../providers/local-storage/local-storage';
import {Ndef, NFC} from "@ionic-native/nfc";
import {GOCAudio} from "../components/form-view/elements/audio/goc-audio";
import {AudioCaptureService} from "../services/audio-capture-service";
import {Media} from "@ionic-native/media";
import {StorageProvider} from "../services/storage-provider";
import {PhotoLibrary} from "@ionic-native/photo-library";
import {SettingsService} from "../services/settings-service";
import { LocalNotifications } from '@ionic-native/local-notifications';
import {LocalNotificationsService} from "../services/local-notifications-service";
import {WheelSelector} from "@ionic-native/wheel-selector";
import {NumberPicker} from "../services/number-picker";
import {Vibration} from "@ionic-native/vibration";
import {Dispatches} from "../views/dispatches";
import {ActionService} from "../services/action-service";


@NgModule({
  declarations: [
    MyApp,
    Login,
    Main,
    Dashboard,
    Forms,
    Settings,
    Dispatches,
    IonPullUpComponent,
    FormSummary,
    FormReview,
    FormCapture,
    FormInstructions,
    FormView,
    LogView,
    SignaturePad,
    FormSelectionView,
    BusinessCard, Image, SimpleName, Signature, SignatureModal, Gps, Address, Checkboxes, Radios, Dropdown, Badge, HTMLBlock, GOCAudio, ImageViewer, UrlChoose,
    ProspectSearch,
    OcrSelector,
    MyCurrencyDirective,
    DynamicFormElementComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicImageViewerModule,
	TextMaskModule, 
	PipesModule,
	BusinessCardOverlayPageModule,
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
    BusinessCard, Image, SimpleName, Signature, SignatureModal, Gps, Address, Checkboxes, Radios, Dropdown, Badge, GOCAudio, ImageViewer, UrlChoose,
    ProspectSearch,
    OcrSelector
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
    FileTransfer,
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
    NFC,
    Ndef,
    StatusBar,
    ScreenOrientation,
    {
      provide: Http,
      useFactory: httpFactory,
      deps: [XHRBackend, RequestOptions]
    },
    Popup,
    Util,
    ThemeProvider,
    LocalStorageProvider,
    AudioCaptureService,
    Media,
    StorageProvider,
    PhotoViewer,
    PhotoLibrary,
    SettingsService,
    LocalNotifications,
    LocalNotificationsService,
    WheelSelector,
    NumberPicker,
    Vibration,
    ActionService
  ]
})
export class AppModule { }

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
}
