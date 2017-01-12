import { Injectable } from "@angular/core";
import { Observable, Observer, BehaviorSubject, Subscription } from "rxjs/Rx";
import { AuthenticationRequest } from "../model/protocol";
import { User, Form, DispatchOrder, FormSubmission, DeviceFormMembership, SubmissionStatus } from "../model";
import { DBClient } from "./db-client";
import { RESTClient } from "./rest-client";
import { SyncClient } from "./sync-client";
import { PushClient } from "./push-client";
import { Transfer, File, Network, Entry } from 'ionic-native';
import { UUID } from "../util/uuid";
declare var cordova: any;

@Injectable()
/**
 * The client to rule them all. The BussinessClient connects all the separate cients and creates
 * usable action flows. For example, authentication is a complex flow consisting of the actual auth
 * profile photos download, saving the registration response to the local database and starting up 
 * the initial sync. 
 * 
 */
export class BussinessClient {

	protected networkSource: BehaviorSubject<"ON"|"OFF">;
    /**
     * Error event
     */
	network: Observable<"ON"|"OFF">;

	private networkOn : Subscription;
	private networkOff : Subscription;

	private online: boolean = true;

	private registration : User;

	private push : PushClient;

	constructor(private db: DBClient, private rest: RESTClient, private sync: SyncClient) {
		
		this.networkSource = new BehaviorSubject<"ON"|"OFF">(null);
		this.network = this.networkSource.asObservable();

		this.networkOff = Network.onDisconnect().subscribe(() => {
			console.log("network was disconnected :-(");
			this.setOnline(false);
		});

		this.networkOn = Network.onConnect().subscribe(() => {
			console.log("network was connected");
			this.setOnline(true);
		});
	}

	public isOnline(): boolean{
		return this.online;
	}

	private setOnline(val: boolean){
		this.online = val;
		this.networkSource.next(val ? "ON" : "OFF");
		this.rest.setOnline(val);
		if(val && this.db.isWorkDbInited()){
			this.db.getConfig("autoUpload").subscribe((val) => {
				if(val == "true"){
					this.doSync();
				}
			});
		}
	}

	public setupNotifications(){
		if(!this.push){
			this.push = new PushClient();
			this.push.error.subscribe((err) => {
				console.error("notification", err);
			});
			this.push.notification.subscribe((note)=>{
				this.db.getConfig("lastSyncDate").subscribe(time =>{ 
					let d = new Date();
					if(time){
						d.setTime(parseInt(time));
					}
					this.sync.download(time ? d : null).subscribe(data => {
						this.db.saveConfig("lastSyncDate", d.getTime() + "").subscribe(()=>{
											
						});
					});
				});
			});
			this.push.initialize();
		}
	}

	public getRegistration(): Observable<User> {
		return new Observable<User>((obs: Observer<User>) => {
			this.db.getRegistration()
				.subscribe((user) => {
					if (user) {
						this.registration = user;
						this.db.setupWorkDb(user.db);
						this.rest.token = user.access_token;
					}
					obs.next(user);
					obs.complete();
				})
		});
	}

	public authenticate(authCode): Observable<{user:User, message:string}> {
		return new Observable<{user:User, message:string}>((obs: Observer<{user:User, message:string}>) => {
			let req = new AuthenticationRequest();
			req.invitation_code = authCode;
			req.device_name = authCode;
			this.rest.authenticate(req).subscribe(reply => {
				let fileTransfer = new Transfer();
				let ext = reply.user_profile_picture.split('.').pop();
				let target = cordova.file.dataDirectory + 'leadliaison/profile/current.' + ext;
				fileTransfer.download(reply.user_profile_picture, target, true, {})
					.then((result) => {
						reply.user_profile_picture = result.nativeURL;
						ext = reply.customer_logo.split('.').pop();
						target = cordova.file.dataDirectory + 'leadliaison/profile/logo.' + ext;
						fileTransfer.download(reply.user_profile_picture, target, true, {})
							.then((result) => {
								reply.customer_logo = result.nativeURL;
								this.registration = reply;
								this.db.saveRegistration(reply).subscribe((done) => {
									this.db.setupWorkDb(reply.db);
									obs.next({user:reply, message: "Done"});
									obs.complete();
									this.sync.download(null).subscribe(downloadData => {
										this.db.saveConfig("lastSyncDate", new Date().getTime() + "").subscribe(()=>{
											obs.next({user:reply, message: "Done"});
										})
									});
								});
							})
							.catch((err) => {
								obs.error("There was an error retrieving the profile picture");
							})
							.catch((err) => {
								obs.error("There was an error retrieving the logo picture")
							});
					});
			});
		});
	}

	public getUpdates(): Observable<boolean>{
		return new Observable<boolean>((obs: Observer<boolean>) => {
			this.db.getConfig("lastSyncDate").subscribe(time =>{ 
				let d = new Date();
				if(time){
					d.setTime(parseInt(time));
				}
				this.sync.download(time ? d : null).subscribe(downloadData => {
					this.db.saveConfig("lastSyncDate", new Date().getTime() + "").subscribe(()=>{
						obs.next(true);
						obs.complete();
					})
				});
			});
		});
	}

	public getForms() : Observable<Form[]>{
		return this.db.getForms();
	}

	public getDispatches() : Observable<DispatchOrder[]>{
		return this.db.getDispatches();
	}

	public getContacts(form: Form): Observable<DeviceFormMembership[]>{
		return this.db.getMemberships(form.form_id);
	}

	public getContact(form: Form, prospectId: number): Observable<DeviceFormMembership>{
		return this.db.getMembership(form.form_id, prospectId);
	}

	public getSubmissions(form: Form, isDispatch): Observable<FormSubmission[]>{
		return this.db.getSubmissions(form.form_id, isDispatch);
	}

	public saveSubmission(sub: FormSubmission, form: Form) : Observable<boolean>{
		form.elements.forEach(element => {
			switch(element.type){
				case "simple_name":
					if(!sub.first_name){
						sub.first_name = <any>sub.fields[element["identifier"] + "_2"];
						sub.last_name = <any>sub.fields[element["identifier"] + "_1"];
					}
					break;
				case "email":
					if(!sub.email){
						sub.email = <any>sub.fields[element["identifier"]];
					}
					break;
			}
		});
		var id = form.getIdByUniqueFieldName("WorkPhone");
		if(id){
			sub.phone = <any>sub.fields[id];
		}
		id = form.getIdByUniqueFieldName("Company");
		if(id){
			sub.company = <any>sub.fields[id];
		}
		return this.db.saveSubmission(sub);
	}

	public doSync(formId?: number){
		if(!this.online){
			return;
		}
		this.db.getSubmissionsToSend().subscribe((submissions) => {
			if(submissions.length == 0){
				//that's it
				return;
			}
			let formIds = [];
			
			if(formId > 0){
				formIds.push(formId);
				var tmp = [];
				submissions.forEach(sub => {
					if(sub.form_id == formId){
						tmp.push(sub);
					}
				});
				submissions = tmp;
			}else{
				submissions.forEach(sub => {
					if(formIds.indexOf(sub.form_id) == -1){
						formIds.push(sub.form_id);
					}
				});
			}
			this.db.getFormsByIds(formIds).subscribe(forms => {
				this.sync.sync(submissions, forms).subscribe(submitted => {
					if(submitted && submitted.length > 0){
						submissions.forEach(sub => {
							sub.status = SubmissionStatus.Submitted;
						})
						this.db.saveSubmisisons(submitted).subscribe((done) => {

						});
					}
				});
			});
		});
	}
}