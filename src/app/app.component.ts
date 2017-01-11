import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { Login } from '../views/login';

import { DBClient } from "../services/db-client";


@Component({
	template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

	rootPage: any;

	constructor(public platform: Platform, private db: DBClient) {
		this.initializeApp();
		this.rootPage = Login;
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.hideSplashScreen();
			StatusBar.hide();
		});
	}


	hideSplashScreen() {
		if (navigator && navigator["splashscreen"]) {
			setTimeout(() => {
				navigator["splashscreen"].hide();
			}, 100);
		}
	}
}
