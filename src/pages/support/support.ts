import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Intercom } from '@ionic-native/intercom';

@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
})
export class SupportPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private intercom : Intercom) {
  }

  ionViewDidEnter(){
    this.intercom.setLauncherVisibility('VISIBLE');
  }

  startConversation(){
    this.intercom.displayConversationsList().then()
    
  }
  ionViewDidLeave(){
   this.intercom.setLauncherVisibility('GONE');
  }

}
