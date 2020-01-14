import { SupportPage } from './../../pages/support/support';
import { Component, ViewChild, NgZone } from '@angular/core';
import { Forms } from "../forms";
import { Settings } from "../settings";
import { BussinessClient } from "../../services/business-service";
import { User } from "../../model";
import { Nav } from 'ionic-angular/components/nav/nav';
import { ThemeProvider } from "../../providers/theme/theme";
import { RapidCaptureService } from "../../services/rapid-capture-service";
import { FormsProvider } from '../../providers/forms/forms';
import { DBClient } from '../../services/db-client';
import { OfflineFilesProvider } from '../../providers/offline-files/offline-files';

@Component({
	selector: 'main',
	templateUrl: 'main.html'
})
export class Main {

	@ViewChild(Nav) nav: Nav;
	rootPage: any = Forms;
	user: User = new User();
	pages: Array<{ title: string, component: any, icon: string, data?: any }>;

	constructor(
		public client: BussinessClient,
		private themeProvider: ThemeProvider,
		private rapidCaptureService: RapidCaptureService,
		private formsProvider: FormsProvider,
		private ngZone : NgZone,
		private dbClient : DBClient,
		private offlineFilesProvider : OfflineFilesProvider
	) {

	}

	openPage(page) {
		this.nav.setRoot(page.component, page.data);
	}


	setPages() {
		this.pages = [
			{ title: 'Events', component: Forms, icon: "document" },
			{ title: 'Settings', component: Settings, icon: "cog" },
		];
		if (this.user.in_app_support)
			this.pages.push({
				title: 'Support',
				component: SupportPage,
				icon: "help",
				data: { documentation: this.user.documentation_url, email: this.user.support_email }
			})
		else {
			this.pages = this.pages.filter((e) => e.title != 'Support');
		}
	}


	ngOnInit() {
		this.client.setupNotifications();
		this.checkUnsentBadges();
		this.client.getUpdates().subscribe(()=>{},(err)=>{},()=>{});
		this.offlineFilesProvider.checkFailedDownloads();
		this.client.userUpdates.subscribe((user: User)=>{
			this.setUser(user);
		})
		this.dbClient.getRegistration().subscribe((user)=>{
			this.setUser(user)
		})
	}
	
	checkUnsentBadges(){
		setTimeout(() => {
			this.rapidCaptureService.processUnsentBadges(this.formsProvider.forms, this.user.theme ? this.user.theme : 'default');
		}, 2000);
	}

	setUser(user : User){
		this.ngZone.run(()=>{
			this.user = user;
			this.setPages();
			this.setTheme();
		})
	}

	setTheme(){
		let theme = this.user.theme ? this.user.theme : 'default';
		this.themeProvider.setActiveTheme(theme + '-theme'); // 
	}

}
