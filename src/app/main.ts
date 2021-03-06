import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { isDevMode, enableProdMode } from '@angular/core';
import * as dev from "../config/dev";
import * as prod from "../config/prod";
import 'hammerjs';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule);

isDevMode() ? dev.setupConfig() : prod.setupConfig();
