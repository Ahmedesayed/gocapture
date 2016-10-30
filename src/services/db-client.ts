import { Injectable } from "@angular/core";
import { SQLite } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Observable, Observer, BehaviorSubject } from "rxjs/Rx";
import { User } from "../model";

@Injectable()
export class DBClient {

	private masterDb : SQLite;
	private workDb : SQLite;

	private tables = [
		{
			name: 'forms',
			master: false,
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'name', type: 'text' },
				{ name: 'title', type: 'text' },
				{ name: 'description', type: 'text' },
				{ name: 'success_message', type: 'text' },
				{ name: 'submit_error_message', type: 'text' },
				{ name: 'submit_button_text', type: 'text' },
				{ name: 'created_at', type: 'text' },
				{ name: 'updated_at', type: 'text' },
				{ name: 'elements', type: 'text' },
				{ name: 'isDispatch', type: 'integer' },
				{ name: 'dispatchData', type: 'text' },
				{ name: 'prospectData', type: 'text' },
				{ name: 'summary', type: 'text' }
			],
			queries: {
				"create": "",
				"update": "",
				"delete": ""
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
				{ name: 'dispatchId', type: 'integer' },
				{ name: 'isDispatch', type: 'integer' }
			],
			queries: {
				"create": "",
				"update": "",
				"delete": ""
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
				{ name: 'searchTerm', type: 'text' },
			],
			queries: {
				"create": "",
				"update": "",
				"delete": ""
			}
		},
		{
			name: 'configuration',
			master: true,
			columns: [
				{ name: 'key', type: 'text primary key' },
				{ name: 'value', type: 'text' }
			],
			queries: {
				"select": "SELECT * FROM configuration where key =(?)",
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
				"select": "SELECT * from org_master WHERE active = 1;",
				"update": "INSERT or REPLACE into org_master (id, name, operator, upload, db, active, token, avatar, logo, custAccName, username, email, title, operatorFirstName, operatorLastName) values  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
				"delete": "DELETE from org_master where id = ?;"
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
	public setupWorkDb(dbName){
		this.workDb = this.initializeDb(this.platform, dbName + ".db", false);
	} 
	/**
	 * 
	 */
	public getConfig(key: string) : Observable<string>{
		return this.getSingle<any>(this.masterDb, "configuration", [key])
		.map((data)=>{
			return data.value;
		});
	}

	/**
	 * 
	 */
	public getAllConfig() : Observable<Object>{
		return this.getAll<any[]>(this.masterDb, "configuration")
		.map((data)=>{
			let resp = {};
			data.forEach((entry : any)=>{
				resp[entry.key] = entry.value;
			});
			return resp;
		});
	}
	/**
	 * 
	 */
	public saveConfig(key: string, value: string) : Observable<boolean>{
		return this.save(this.masterDb, "configuration", [key, value]);
	}
	/**
	 * 
	 */
	public deleteConfig(key: string) : Observable<boolean>{
		return this.remove(this.masterDb, "configuration", [key]);
	}
	/**
	 * 
	 */
	public getRegistration() : Observable<User>{
		return this.getSingle<any>(this.masterDb, "org_master", null)
		.map((data)=>{
			if(data){
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
				return user;
			}
			return null;
		});
	}
	/**
	 * 
	 */
	public saveRegistration(user: User) : Observable<boolean>{
		user.db = user.customer_name.replace(/\s*/g, '');
		return this.save(this.masterDb, "org_master", [
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
		]);
	}
	/**
	 * 
	 */
	public deleteRegistration(authId: string) : Observable<boolean>{
		return this.remove(this.masterDb, "org_master", [authId]);
	}

	private remove(db: SQLite, table: string, parameters: any[]) : Observable<boolean>{
		return new Observable<boolean>((responseObserver: Observer<boolean>) => {
			db.executeSql(this.getQuery(table, "delete"), parameters)
			.then((data)=>{
				if(data.rowsAffected == 1){
					responseObserver.next(true);
					responseObserver.complete();
				}else{
					responseObserver.error("Wrong number of affected rows: " + data.rowsAffected);
				}
			}, (err) => {
				responseObserver.error("An error occured: " + err);
			});
		});
	}

	private save(db: SQLite, table: string, parameters: any[]) : Observable<boolean>{
		return new Observable<boolean>((responseObserver: Observer<boolean>) => {
			db.executeSql(this.getQuery(table, "update"), parameters)
			.then((data)=>{
				if(data.rowsAffected == 1){
					responseObserver.next(true);
					responseObserver.complete();
				}else{
					responseObserver.error("Wrong number of affected rows: " + data.rowsAffected);
				}
			}, (err) => {
				responseObserver.error("An error occured: " + err);
			});
		});
	}

	public getSingle<T>(db: SQLite, table: string, parameters: any[]) : Observable<T>{
		return new Observable<T>((responseObserver: Observer<T>) => {
			db.executeSql(this.getQuery(table, "select"), parameters)
			.then((data)=>{
				if(data.rows.length == 1){
					responseObserver.next(data.rows.item(0));
					responseObserver.complete();
				}else if(data.rows.length == 0){
					responseObserver.next(null);
					responseObserver.complete();
				}else{
					responseObserver.error("More than one entry found");
				}
			}, (err) => {
				responseObserver.error("An error occured: " + err);
			});
		});
	}

	public getMultiple<T>(db: SQLite, table: string, parameters: any[]) : Observable<T[]>{
		return new Observable<T[]>((responseObserver: Observer<T[]>) => {
			db.executeSql(this.getQuery(table, "select"), parameters)
			.then((data)=>{
				var resp = [];
				for(let i = 0; i < data.rows.length; i++){
					resp.push(data.rows.item(i));
				}
				responseObserver.next(resp);
				responseObserver.complete();
			}, (err) => {
				responseObserver.error("An error occured: " + err);
			});
		});
	}

	public getAll<T>(db: SQLite, table: string) : Observable<T[]>{
		return new Observable<T[]>((responseObserver: Observer<T[]>) => {
			db.executeSql("select * from " + table, null)
			.then((data)=>{
				var resp = [];
				for(let i = 0; i < data.rows.length; i++){
					resp.push(data.rows.item(i));
				}
				responseObserver.next(resp);
				responseObserver.complete();
			}, (err) => {
				responseObserver.error("An error occured: " + err);
			});
		});
	}

	private initializeDb(platform: Platform, name: string, master: boolean) : any{
		let db = this.getDb(platform);
		db.openDatabase({
			name: name,
			location: 'default' // the location field is required
		}).then(() => {
			this.setup(db, master);
		}, (err) => {
			console.error('Unable to open database: ', err);
		});
		return db;
	}

	private getDb(platform): any{
		if (platform.is("cordova")) {
			return new SQLite();
		}
		return new LocalSql();
	}

	private setup(db, master) {
		let index = 0;

		let handler = () => {
			if(index >= this.tables.length){
				return;
			}
			while(this.tables[index].master != master){
				index++;
				if(index >= this.tables.length){
					return;
				}
			}
			let query = this.makeCreateTableQuery(this.tables[index]);
			index++;
			db.executeSql(query).then(handler, (err) => {
				console.error('Unable to execute sql: ', err);
			});
		};

		handler();
	}

	private makeCreateTableQuery(table){
		var columns = [];
		table.columns.forEach((col) => {
			columns.push(col.name + ' ' + col.type);
		});
		let query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
		return query;
	}

	private getQuery(table : string, type : string) : string{
		for(let i = 0; i < this.tables.length; i++){
			if(this.tables[i].name == table){
				return this.tables[i].queries[type];
			}
		}
		return "";
	}
}

class LocalSql {
	private db: any;

	openDatabase(opts: {name: string, location: string}): Promise<any> {
		let name= opts.name;
		let description = opts.name;
		let size = 2*1024*1024;
		let version= "1.0";
		return new Promise<any>((resolve, reject) => {
			this.db = window["openDatabase"](name, version, description, size, (db) => {
				resolve(null);
			});
			setTimeout(()=>{
				resolve(null)
			}, 1);
		});
	}

	executeSql(query, args): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.transaction(function (t) {
				t.executeSql(query, args,
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