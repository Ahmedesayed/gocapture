import { Injectable } from "@angular/core";
import { SQLite } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import { User, Form, DispatchOrder, FormElement, FormSubmission, DeviceFormMembership } from "../model";

let MASTER = "master";
let WORK = "work";

@Injectable()
export class DBClient {

	private masterDb: Observable<SQLite>;
	private workDb: Observable<SQLite>;

	private map = {};

	private registration: User;

	private saveAllEnabled = false;
	private saveAllPageSize = 50;
	private saveAllData: { query: string, type: string, parameters: any[] }[] = [];

	private tables = [
		{
			name: 'forms',
			master: false,
			columns: [
				{ name: 'id', type: 'integer not null' },
				{ name: 'formId', type: 'integer' },
				{ name: 'name', type: 'text' },
				{ name: 'title', type: 'text' },
				{ name: 'listId', type: 'text' },
				{ name: 'description', type: 'text' },
				{ name: 'success_message', type: 'text' },
				{ name: 'submit_error_message', type: 'text' },
				{ name: 'submit_button_text', type: 'text' },
				{ name: 'created_at', type: 'text' },
				{ name: 'updated_at', type: 'text' },
				{ name: 'elements', type: 'text' },
				{ name: 'isDispatch', type: 'integer not null' },
				{ name: 'dispatchData', type: 'text' },
				{ name: 'prospectData', type: 'text' },
				{ name: 'summary', type: 'text' },
				{ name: "primary key", type: "(id, isDispatch)" }
			],
			queries: {
				"select": "SELECT * FROM forms where isDispatch=?",
				"selectByIds": "SELECT * FROM forms where id in (?)",
				"selectAll": "SELECT id, formId, listId, name, title, description, success_message, submit_error_message, submit_button_text, created_at, updated_at, elements, isDispatch, dispatchData, prospectData, summary, (SELECT count(*) FROM submissions WHERE status >= 1 and submissions.formId=Forms.id and  submissions.isDispatch = (?)) AS totalSub, (SELECT count(*) FROM submissions WHERE status in (2, 3) and submissions.formId=Forms.id and submissions.isDispatch = (?)) AS totalHold FROM forms where isDispatch = (?)",
				"update": "INSERT OR REPLACE INTO forms ( id, formId, name, listId, title, description, success_message, submit_error_message, submit_button_text, created_at, updated_at, elements, isDispatch, dispatchData, prospectData, summary) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?)",
				"delete": "DELETE from forms where id=?"
			}
		},
		{
			name: 'submissions',
			master: false,
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'title', type: 'text' },
				{ name: 'sub_date', type: 'text' },
				{ name: 'formId', type: 'integer' },
				{ name: 'data', type: 'text' },
				{ name: 'status', type: 'integer' },
				{ name: 'firstName', type: 'text' },
				{ name: 'lastName', type: 'text' },
				{ name: 'email', type: 'text' },
				{ name: 'dispatchId', type: 'integer' },
				{ name: 'isDispatch', type: 'integer' }
			],
			queries: {
				"select": "SELECT * FROM submissions where formId=? and isDispatch=?",
				"selectAll": "SELECT * FROM submissions where formId=? and isDispatch=?",
				"toSend": "SELECT * FROM submissions where status=4",
				"update": "INSERT OR REPLACE INTO submissions (id, formId, data, sub_date, status, firstName, lastName, email, isDispatch, dispatchId) VALUES (?,?,?,?,?,?,?,?,?,?)",
				"delete": "DELETE from submissions where id=?"
			}
		},
		{
			name: 'notifications',
			master: false,
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'data', type: 'text' },
				{ name: 'processed', type: 'text' }
			],
			queries: {
				"create": "",
				"update": "",
				"delete": ""
			}
		},
		{
			name: 'contacts',
			master: false,
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'data', type: 'text' },
				{ name: 'formId', type: 'integer' },
				{ name: 'membershipId', type: 'integer' },
				{ name: 'prospectId', type: 'integer' },
				{ name: 'added', type: 'string' },
				{ name: 'searchTerm', type: 'text' },
			],
			queries: {
				"selectAll": "select * from contacts where formId=?",
				"select": "select * from contacts where formId=? and prospectId=?",
				"update": "INSERT OR REPLACE INTO contacts (id, data, formId, membershipId, prospectId, added, searchTerm) VALUES (?, ?, ?, ?, ?, ?, ?)",
				"delete": "delete from contacts where id=?"
			}
		},
		{
			name: 'configuration',
			master: false,
			columns: [
				{ name: 'key', type: 'text primary key' },
				{ name: 'value', type: 'text' }
			],
			queries: {
				"select": "SELECT * FROM configuration where key =?",
				"selectAll": "SELECT * from configuration",
				"update": "INSERT OR REPLACE INTO configuration (key, value) VALUES (?,?)",
				"delete": "DELETE FROM configuration WHERE key = (?)"
			}
		},
		{
			name: "org_master",
			master: true,
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'name', type: 'text' },
				{ name: 'upload', type: 'integer' },
				{ name: 'operator', type: 'text' },
				{ name: 'db', type: 'text' },
				{ name: 'active', type: 'integer' },
				{ name: 'token', type: 'text' },
				{ name: 'avatar', type: 'text' },
				{ name: 'logo', type: 'text' },
				{ name: 'custAccName', type: 'text' },
				{ name: 'username', type: 'text' },
				{ name: 'email', type: 'text' },
				{ name: 'title', type: 'text' },
				{ name: 'operatorFirstName', type: 'text' },
				{ name: 'operatorLastName', type: 'text' }
			],
			queries: {
				"select": "SELECT * from org_master WHERE active = 1",
				"update": "INSERT or REPLACE into org_master (id, name, operator, upload, db, active, token, avatar, logo, custAccName, username, email, title, operatorFirstName, operatorLastName) VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
				"delete": "DELETE from org_master where id = ?"
			}
		}
	];
	/**
	 * 
	 */
	constructor(private platform: Platform) {
		this.masterDb = this.initializeDb(platform, "tradeshow.db", true);
	}
	/**
	 * 
	 */
	public setupWorkDb(dbName) {
		this.workDb = this.initializeDb(this.platform, dbName + ".db", false);
	}

	public isWorkDbInited(): boolean {
		return this.workDb != null && this.map[WORK] != null;
	}
	/**
	 * 
	 */
	public getConfig(key: string): Observable<string> {
		return this.getSingle<any>(WORK, "configuration", [key])
			.map((entry) => {
				return entry ? entry.value : "";
			});
	}

	/**
	 * 
	 */
	public getAllConfig(): Observable<Object> {
		return this.getAll<any[]>(WORK, "configuration", [])
			.map((data) => {
				let resp = {};
				data.forEach((entry: any) => {
					resp[entry.key] = entry ? entry.value : "";
				});
				return resp;
			});
	}
	/**
	 * 
	 */
	public saveConfig(key: string, value: string): Observable<boolean> {
		return this.save(WORK, "configuration", [key, value]);
	}
	/**
	 * 
	 */
	public deleteConfig(key: string): Observable<boolean> {
		return this.remove(WORK, "configuration", [key]);
	}

	private parseForm(dbForm): Form {
		let form = new Form();
		form.id = dbForm.id;
		form.form_id = dbForm.formId;
		form.description = dbForm.description;
		form.title = dbForm.title;
		form.list_id = parseInt(dbForm.listId + "");
		form.name = dbForm.name;
		form.success_message = dbForm.success_message;
		form.submit_error_message = dbForm.submit_error_message;
		form.submit_button_text = dbForm.submit_button_text;
		form.elements = typeof dbForm.elements == "string" ? JSON.parse(dbForm.elements) : dbForm.elements;
		if (form.elements && form.elements.length > 0) {
			form.elements.sort((e1: FormElement, e2: FormElement): number => {
				if (e1.position < e2.position) {
					return -1;
				}
				if (e1.position > e2.position) {
					return 1;
				}
				return 0;
			})
			form.elements.forEach((e) => {
				if (e.options && e.options.length > 0) {
					e.options.sort((o1, o2): number => {
						if (o1.position < o2.position) {
							return -1;
						}
						if (o1.position > o2.position) {
							return 1;
						}
						return 0;
					});
				}
			});
		}
		form.total_submissions = dbForm.totalSub;
		form.total_hold = dbForm.totalHold;
		return form;
	}

	public getForms(): Observable<Form[]> {
		return this.getAll<any[]>(WORK, "forms", [false, false, false])
			.map((data) => {
				let forms = [];
				data.forEach((dbForm: any) => {
					forms.push(this.parseForm(dbForm));
				});
				return forms;
			});
	}

	public getFormsByIds(ids: number[]): Observable<Form[]> {
		return new Observable<Form[]>((responseObserver: Observer<Form[]>) => {
			this.db(WORK).subscribe((db) => {
				db.executeSql(this.getQuery("forms", "selectByIds"), [ids])
					.then((data) => {
						var resp = [];
						for (let i = 0; i < data.rows.length; i++) {
							let dbForm = data.rows.item(i);
							resp.push(this.parseForm(dbForm));
						}
						responseObserver.next(resp);
						responseObserver.complete();
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	public saveForm(form: Form): Observable<boolean> {
		//id, name, list_id, title, description, success_message, submit_error_message, submit_button_text, created_at, updated_at, elements, isDispatch, dispatchData, prospectData, summary
		return this.save(WORK, "forms", [form.id, form.form_id, form.name, form.list_id, form.title, form.description, form.success_message, form.submit_error_message, form.submit_button_text, form.created_at, form.updated_at, JSON.stringify(form.elements), false, null, null, null]);
	}

	public saveForms(forms: Form[]): Observable<boolean> {
		return this.saveAll<Form>(forms, "Form");
	}
	/**
	 * 
	 */
	public getRegistration(): Observable<User> {
		return this.getSingle<any>(MASTER, "org_master", null)
			.map((data) => {
				if (data) {
					let user = new User();
					user.access_token = data.token;
					user.customer_account_name = data.custAccName;
					user.user_profile_picture = data.avatar;
					user.customer_logo = data.logo;
					user.user_name = data.username;
					user.customer_name = data.name;
					user.db = data.db;
					user.email = data.email;
					user.first_name = data.operatorFirstName;
					user.id = data.id;
					user.is_active = data.active;
					user.last_name = data.operatorLastName;
					user.title = data.title;
					this.registration = user;
					return user;
				}
				return null;
			});
	}

	public getDispatches(): Observable<DispatchOrder[]> {
		return this.getAll<any[]>(WORK, "forms", [true, true, true])
			.map((data) => {
				let forms = [];
				data.forEach((dbForm: any) => {
					let form = new DispatchOrder();
					form.form_id = dbForm.id;
					form.description = dbForm.description;
					form.name = dbForm.name;
					form.total_submissions = dbForm.totalSub;
					form.total_hold = dbForm.totalHold;
					let dispatch = JSON.parse(dbForm.dispatchData);
					form.device_id = dispatch.device_id;
					form.prospect_id = dispatch.prospect_id;
					form.fields_values = dispatch.fields_values;
					form.status = dispatch.status;
					form.form = this.parseForm(dispatch.form);
					forms.push(form);
				});
				return forms;
			});
	}

	public saveDispatchOrder(order: DispatchOrder): Observable<boolean> {
		console.log("saving");
		//id, name, title, description, success_message, submit_error_message, submit_button_text, created_at, updated_at, elements, isDispatch, dispatchData, prospectData, summary
		return this.save(WORK, "forms", [order.id, order.form_id, order.name, order.form.title, order.description || order.form.description, order.form.success_message, order.form.submit_error_message, order.form.submit_button_text, order.date_created, order.date_last_modified, JSON.stringify(order.form.elements), true, JSON.stringify(order), null, null]);
	}

	public saveDispatches(forms: DispatchOrder[]): Observable<boolean> {
		return this.saveAll<DispatchOrder>(forms, "DispatchOrder");
	}

	public getMemberships(form_id: number): Observable<DeviceFormMembership[]> {
		return this.getAll<any[]>(WORK, "contacts", [form_id])
			.map((data) => {
				let forms = [];
				data.forEach((dbForm: any) => {
					let form = new DeviceFormMembership();
					form.form_id = dbForm.formId;
					form.id = dbForm.id;
					form.added_date = dbForm.added;
					form.membership_id = dbForm.membershipId;
					form.prospect_id = dbForm.prospectId;
					form.fields = JSON.parse(dbForm.data);
					form["search"] = form.fields["Email"] + " " + form.fields["FirstName"] + " " + form.fields["LastName"];
					forms.push(form);
				});
				return forms;
			});
	}

	public getMembership(form_id: number, prospect_id: number): Observable<DeviceFormMembership> {
		return this.getSingle<any>(WORK, "contacts", [form_id, prospect_id])
			.map((dbForm) => {
				if (dbForm) {
					let form = new DeviceFormMembership();
					form.form_id = dbForm.formId;
					form.id = dbForm.id;
					form.added_date = dbForm.added;
					form.membership_id = dbForm.membershipId;
					form.prospect_id = dbForm.prospectId;
					form.fields = JSON.parse(dbForm.data);
					form["search"] = form.fields["Email"] + " " + form.fields["FirstName"] + " " + form.fields["LastName"];

					return form;
				}
				return null;
			});
	}

	public saveMembership(form: DeviceFormMembership): Observable<boolean> {
		return this.save(WORK, "contacts", [form.membership_id, JSON.stringify(form.fields), form.form_id, form.membership_id, form.prospect_id, form.added_date, ""]);
	}

	public saveMemberships(forms: DeviceFormMembership[]): Observable<boolean> {
		return this.saveAll<DeviceFormMembership>(forms, "Membership");
	}

	public getSubmissions(formId: number, isDispatch): Observable<FormSubmission[]> {
		return this.getAll<any[]>(WORK, "submissions", [formId, isDispatch])
			.map((data) => {
				let forms = [];
				data.forEach((dbForm: any) => {
					let form = new FormSubmission();
					form.id = dbForm.id;
					form.form_id = dbForm.formId;
					form.fields = JSON.parse(dbForm.data);
					form.status = dbForm.status;
					form.first_name = dbForm.firstName;
					form.last_name = dbForm.lastName;
					form.email = dbForm.email;
					forms.push(form);
				});
				return forms;
			});
	}

	public getSubmissionsToSend(): Observable<FormSubmission[]> {
		return new Observable<FormSubmission[]>((responseObserver: Observer<FormSubmission[]>) => {
			this.db(WORK).subscribe((db) => {
				db.executeSql(this.getQuery("submissions", "toSend"), {})
					.then((data) => {
						var resp = [];
						for (let i = 0; i < data.rows.length; i++) {
							let dbForm = data.rows.item(i);
							let form = new FormSubmission();
							form.id = dbForm.id;
							form.form_id = dbForm.formId;
							form.fields = JSON.parse(dbForm.data);
							form.status = dbForm.status;
							form.first_name = dbForm.firstName;
							form.last_name = dbForm.lastName;
							form.email = dbForm.email;
							resp.push(form);
						}
						responseObserver.next(resp);
						responseObserver.complete();
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	public saveSubmission(form: FormSubmission): Observable<boolean> {
		//id, formId, data, sub_date, status, isDispatch, dispatchId
		return this.save(WORK, "submissions", [form.id, form.form_id, JSON.stringify(form.fields), new Date().toISOString(), form.status, form.first_name, form.last_name, form.email, false, null]);
	}

	public saveSubmisisons(forms: FormSubmission[]): Observable<boolean> {
		return this.saveAll<FormSubmission>(forms, "Submission");
	}

	/**
	 * 
	 */
	public saveRegistration(user: User): Observable<boolean> {
		user.db = user.customer_name.replace(/\s*/g, '');
		return this.save(MASTER, "org_master", [
			user.id,
			user.customer_name,
			user.first_name + ' ' + user.last_name,
			1,
			user.db,
			1,
			user.access_token,
			user.user_profile_picture,
			user.customer_logo,
			user.customer_account_name,
			user.user_name,
			user.email,
			user.title,
			user.first_name,
			user.last_name
		]).map(data => {
			this.registration = user;
			return data;
		});
	}

	public deleteRegistration(authId: string): Observable<boolean> {
		return this.remove(MASTER, "org_master", [authId])
			.map(data => {
				this.registration = null;
				return data;
			});
	}

	private remove(type: string, table: string, parameters: any[]): Observable<boolean> {
		return new Observable<boolean>((responseObserver: Observer<boolean>) => {
			this.db(type).subscribe((db) => {
				db.executeSql(this.getQuery(table, "delete"), parameters)
					.then((data) => {
						if (data.rowsAffected == 1) {
							responseObserver.next(true);
							responseObserver.complete();
						} else {
							responseObserver.error("Wrong number of affected rows: " + data.rowsAffected);
						}
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	private saveAll<T>(items: T[], type: string): Observable<boolean> {
		return new Observable<boolean>((obs: Observer<boolean>) => {
			if (!items || items.length == 0) {
				setTimeout(() => {
					obs.next(true);
					obs.complete();
				});
				return;
			}
			this.saveAllEnabled = true;
			let index = 0;
			console.log(new Date().getTime());
			let name = "save" + type;
			let exec = (done: boolean) => {
				let query = this.saveAllData[0].query;
				let params = [].concat(this.saveAllData[0].parameters);
				for (var i = 1; i < this.saveAllData.length; i++) {
					query += ", " + this.saveAllData[0].query.split("VALUES")[1];
					params.push.apply(params, this.saveAllData[i].parameters);
				}
				let isDone = done;
				this.db(this.saveAllData[0].type).subscribe((db) => {
					db.executeSql(query, params)
						.then((data) => {
							this.saveAllData = [];
							if (data.rowsAffected > 0) {
								if (isDone) {
									this.saveAllEnabled = false;
									obs.next(true);
									obs.complete();
									console.log(new Date().getTime());
								} else {
									handler(true);
								}
							} else {
								this.saveAllEnabled = false;
								obs.error("Wrong number of affected rows: " + data.rowsAffected);
							}
						}, (err) => {
							this.saveAllEnabled = false;
							this.saveAllData = [];
							obs.error(err);
						});
				});
			};
			let handler = (resp: boolean, stopExec?: boolean) => {
				index++;
				if (index % this.saveAllPageSize == 0 || index == items.length) {
					exec(index == items.length);
				} else if (index < items.length) {
					this[name](items[index]).subscribe(handler);
				}
			};
			this[name](items[0]).subscribe(handler);
		});
	}

	private save(type: string, table: string, parameters: any[]): Observable<boolean> {
		return new Observable<boolean>((responseObserver: Observer<boolean>) => {
			if (this.saveAllEnabled) {
				this.saveAllData.push({ query: this.getQuery(table, "update"), type: type, parameters: parameters });
				setTimeout(() => {
					responseObserver.next(true);
					responseObserver.complete();
				});
				return;
			}
			this.db(type).subscribe((db) => {
				db.executeSql(this.getQuery(table, "update"), parameters)
					.then((data) => {
						if (data.rowsAffected == 1) {
							responseObserver.next(true);
							responseObserver.complete();
						} else {
							responseObserver.error("Wrong number of affected rows: " + data.rowsAffected);
						}
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	private getSingle<T>(type: string, table: string, parameters: any[]): Observable<T> {
		return new Observable<T>((responseObserver: Observer<T>) => {
			this.db(type).subscribe((db) => {
				db.executeSql(this.getQuery(table, "select"), parameters)
					.then((data) => {
						if (data.rows.length == 1) {
							responseObserver.next(data.rows.item(0));
							responseObserver.complete();
						} else if (data.rows.length == 0) {
							responseObserver.next(null);
							responseObserver.complete();
						} else {
							responseObserver.error("More than one entry found");
						}
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	private getMultiple<T>(type: string, table: string, parameters: any[]): Observable<T[]> {
		return new Observable<T[]>((responseObserver: Observer<T[]>) => {
			this.db(type).subscribe((db) => {
				db.executeSql(this.getQuery(table, "select"), parameters)
					.then((data) => {
						var resp = [];
						for (let i = 0; i < data.rows.length; i++) {
							resp.push(data.rows.item(i));
						}
						responseObserver.next(resp);
						responseObserver.complete();
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	private getAll<T>(type: string, table: string, params?: any[]): Observable<T[]> {
		return new Observable<T[]>((responseObserver: Observer<T[]>) => {
			this.db(type).subscribe((db) => {
				db.executeSql(this.getQuery(table, "selectAll"), params)
					.then((data) => {
						var resp = [];
						for (let i = 0; i < data.rows.length; i++) {
							resp.push(data.rows.item(i));
						}
						responseObserver.next(resp);
						responseObserver.complete();
					}, (err) => {
						responseObserver.error("An error occured: " + err);
					});
			});
		});
	}

	private db(type: string): Observable<SQLite> {
		return new Observable<SQLite>((obs: Observer<SQLite>) => {
			if (this.map[type]) {
				setTimeout(() => {
					obs.next(this.map[type]);
					obs.complete();
				})
			} else {
				let o: Observable<SQLite> = null;

				let iterate = () => {
					switch (type) {
						case MASTER:
							o = this.masterDb;
							break;
						case WORK:
							o = this.workDb;
							break;
						default:
							o = null;
					}
					if (!o) {
						console.log("waiting for " + type);
						setTimeout(iterate, 100);
					} else {
						o.subscribe((db) => {
							this.map[type] = db;
							obs.next(this.map[type]);
							obs.complete();
						});
					}
				};

				iterate();
			}
		});
	}

	private initializeDb(platform: Platform, name: string, master: boolean): Observable<SQLite> {
		return new Observable<SQLite>((obs: Observer<SQLite>) => {
			platform.ready().then(() => {
				let db = null;
				if (platform.is("cordova")) {
					db = new SQLite();
				} else {
					db = new LocalSql();
				}
				db.openDatabase({
					name: name,
					location: 'default' // the location field is required
				}).then(() => {
					this.setup(db, master);
					setTimeout(() => {
						obs.next(db);
						obs.complete();
					}, 250);
				}, (err) => {
					console.error('Unable to open database: ', err);
					obs.error(err);
				});
			});
		});
	}

	private setup(db: SQLite, master) {
		let index = 0;

		let handler = (data) => {
			if (index >= this.tables.length) {
				return;
			}
			while (this.tables[index].master != master) {
				index++;
				if (index >= this.tables.length) {
					return;
				}
			}
			let query = this.makeCreateTableQuery(this.tables[index]);
			index++;
			db.executeSql(query, {}).then(handler, (err) => {
				if (err.hasOwnProperty("rows")) {
					handler(err);
					return;
				}
				console.error('Unable to execute sql: ', err);
			});
		};

		handler(null);
	}

	private makeCreateTableQuery(table) {
		var columns = [];
		table.columns.forEach((col) => {
			columns.push(col.name + ' ' + col.type);
		});
		let query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
		return query;
	}

	private getQuery(table: string, type: string): string {
		for (let i = 0; i < this.tables.length; i++) {
			if (this.tables[i].name == table) {
				return this.tables[i].queries[type];
			}
		}
		return "";
	}
}

class LocalSql {
	private db: any;

	openDatabase(opts: { name: string, location: string }): Promise<any> {
		let name = opts.name;
		let description = opts.name;
		let size = 2 * 1024 * 1024;
		let version = "1.0";
		return new Promise<any>((resolve, reject) => {
			this.db = window["openDatabase"](name, version, description, size, (db) => {
				resolve(null);
			});
			setTimeout(() => {
				resolve(null)
			}, 1);
		});
	}

	executeSql(query, args): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.transaction(function (t) {
				let params = args || {};
				if (Object.keys(params).length == 0) {
					params = [];
				}
				t.executeSql(query, params,
					(t, r) => {
						resolve(r);
					},
					(tx, err) => {
						console.log(err);
						reject(err);
					});
			});
		});
	};
}