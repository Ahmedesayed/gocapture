import { Keyboard } from '@ionic-native/keyboard';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { RESTClient } from "../services/rest-client";
import { DBClient } from "../services/db-client";
import { PushClient } from "../services/push-client";
import { SyncClient } from "../services/sync-client";
import { LogClient } from "../services/log-client";
import { BussinessClient } from "../services/business-service";
import { ImageProcessor } from "../services/image-processor";
import { IonPullUpComponent } from '../components/ion-pullup';
import { OcrSelector } from "../components/ocr-selector";
import { FormView, FormSelectionView } from '../components/form-view';
import {
  BusinessCard,
  Image,
  SimpleName,
  Signature,
  SignatureModal,
  SignaturePad,
  Gps,
  Address,
  Checkboxes,
  Radios,
  Dropdown,
  Badge,
  ImageViewer,
  Document
} from "../components/form-view/elements";
import { Insomnia } from '@ionic-native/insomnia';
import { ProspectSearch } from "../views/prospect-search";
import { TextMaskModule } from 'angular2-text-mask';
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
import { PhotoViewer } from "@ionic-native/photo-viewer";

import { StatusBar } from "@ionic-native/status-bar";
import { Popup } from '../providers/popup/popup';
import { IonicApp } from 'ionic-angular/components/app/app-root';
import { IonicModule } from 'ionic-angular/module';
import { Util } from "../util/util";
import { DynamicFormElementComponent } from "../components/form-view/dynamic-form-element/dynamic-form-element";
import { HTMLBlock } from "../components/form-view/elements/html-block";
import { HTTP } from "@ionic-native/http";
import { ThemeProvider } from '../providers/theme/theme';
import { PipesModule } from '../pipes/pipes.module';
import { BusinessCardOverlayPageModule } from '../views/business-card-overlay/business-card-overlay.module';
import { LocalStorageProvider } from '../providers/local-storage/local-storage';
import { Ndef, NFC } from "@ionic-native/nfc";
import { GOCAudio } from "../components/form-view/elements/audio/goc-audio";
import { AudioCaptureService } from "../services/audio-capture-service";
import { Media } from "@ionic-native/media";
import { PhotoLibrary } from "@ionic-native/photo-library";
import { SettingsService } from "../services/settings-service";
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LocalNotificationsService } from "../services/local-notifications-service";
import { WheelSelector } from "@ionic-native/wheel-selector";
import { NumberPicker } from "../services/number-picker";
import { Vibration } from "@ionic-native/vibration";
import { Dispatches } from "../views/dispatches";
import { ActionService } from "../services/action-service";
import { RapidCaptureService } from "../services/rapid-capture-service";
import { BadgeRapidCapture } from "../services/badge-rapid-capture";
import { BCRapidCapture } from "../services/bc-rapid-capture";
import { DuplicateLeadsService } from "../services/duplicate-leads-service";
import { AppPreferences } from "@ionic-native/app-preferences";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { FileOpener } from "@ionic-native/file-opener";
import { DocumentsService } from "../services/documents-service";
import { SocialSharing } from "@ionic-native/social-sharing";
import { SubmissionsRepository } from "../services/submissions-repository";
import { SubmissionMapper } from "../services/submission-mapper";
import { DocumentsSyncClient } from "../services/documents-sync-client";
import { ShareService } from "../services/share-service";
import { StationsPage } from "../views/stations/stations";
import { IonicImageLoader } from "ionic-image-loader";
import { EventItemComponent } from '../components/event-item/event-item';
import { ScreenSaverPage } from '../pages/screen-saver/screen-saver';
import { formViewService } from '../components/form-view/form-view-service';
import { ComponentsModule } from "../components/components.module";
import { FilterService } from "../services/filter-service";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { SectionBlock } from '../components/section-block';

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
    BusinessCard,
    Image,
    SimpleName,
    Signature,
    SignatureModal,
    Gps,
    Address,
    Document,
    Checkboxes,
    Radios,
    Dropdown,
    Badge,
    HTMLBlock,
    GOCAudio,
    ImageViewer,
    UrlChoose,
    ProspectSearch,
    OcrSelector,
    MyCurrencyDirective,
    DynamicFormElementComponent,
    StationsPage,
    EventItemComponent,
    ScreenSaverPage,
    SectionBlock,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    TextMaskModule,
    PipesModule,
    BusinessCardOverlayPageModule,
    TextMaskModule,
    PipesModule,
    BusinessCardOverlayPageModule,
    IonicImageLoader.forRoot(),
    ComponentsModule,
    NgSelectModule,
    FormsModule,
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
    BusinessCard,
    Image,
    SimpleName,
    Signature,
    SignatureModal,
    Gps,
    Address,
    Document,
    Checkboxes,
    Radios,
    Dropdown,
    Badge,
    GOCAudio,
    ImageViewer,
    UrlChoose,
    ProspectSearch,
    OcrSelector,
    StationsPage,
    EventItemComponent,
    ScreenSaverPage,

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
    PhotoViewer,
    PhotoLibrary,
    SettingsService,
    LocalNotifications,
    LocalNotificationsService,
    WheelSelector,
    NumberPicker,
    Vibration,
    ActionService,
    RapidCaptureService,
    BadgeRapidCapture,
    BCRapidCapture,
    DuplicateLeadsService,
    AppPreferences,
    DocumentViewer,
    FileOpener,
    DocumentsService,
    DocumentsSyncClient,
    SocialSharing,
    SubmissionsRepository,
    SubmissionMapper,
    ShareService,
    Insomnia,
    formViewService,
    FilterService,
    Keyboard
  ]
})
export class AppModule { }

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
}
