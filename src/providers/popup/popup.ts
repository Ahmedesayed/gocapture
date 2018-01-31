import { Injectable } from '@angular/core';
import {AlertController, Alert} from "ionic-angular";


@Injectable()
export class Popup {

  private alert: Alert;

  constructor(public alertCtrl: AlertController) {
    //
  }

  showAlert(title, message, buttons) {
    if (this.alert) {
      this.alert.dismiss();
    }
    this.alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: buttons,
      enableBackdropDismiss: false
    });

    this.alert.present();
  }

  showPrompt(title, message, inputs, buttons) {

    if (this.alert) {
      this.alert.dismiss();
    }

    this.alert = this.alertCtrl.create({
      title: title,
      message: message,
      inputs: inputs,
      buttons: buttons,
    });
    this.alert.present();
  }

  dismissAll() {
    if (this.alert) {
      this.alert.dismiss();
    }
  }
}