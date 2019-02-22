import { Injectable } from "@angular/core";
import {ILocalNotification, LocalNotifications} from "@ionic-native/local-notifications";
import {ISubscription} from "rxjs/Subscription";
import {Settings} from "../views/settings";
import {SettingsService} from "./settings-service";
import {settingsKeys} from "../constants/constants";

@Injectable()
export class LocalNotificationsService {

  actionSub: ISubscription;

	constructor(private localNotifications: LocalNotifications, private settingsService: SettingsService) {
	  this.checkPermissions();
	}

	clearAll () {
	  this.localNotifications.clearAll();
  }

  async scheduleUnsubmittedLeadsNotification() {
	  let hasPermission = await this.localNotifications.hasPermission();

	  if (!hasPermission) {
	    return
    }

	  this.settingsService.getSetting(settingsKeys.REMIND_ABOUT_UNSUBMITTED_LEADS).subscribe(result => {
	    if (result && result['remind']) {
        this.localNotifications.clearAll().then(result => {

          let options: ILocalNotification = {
            id: 1,
            text: 'You have leads that have not been submitted. Please open the GoCapture! app and submit them.',
            launch: false,
            trigger: {every: {minute: result["interval"]}},
            priority: 2,
            foreground: false
          };

          this.localNotifications.schedule(options);

          if (this.actionSub) {
            this.actionSub.unsubscribe();
          }

          this.actionSub = this.localNotifications.on('click').subscribe((success) => {
            //
          });
        });
      }
    });
  }

	private onNotification() {
	  //
	}

	private async checkPermissions() {
    return await this.localNotifications.hasPermission();
  }

}
