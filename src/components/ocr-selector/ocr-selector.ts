import { Component, ElementRef, ViewChild, NgZone, HostListener } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { NavParams, ActionSheetController, AlertController, ViewController, Content } from "ionic-angular";
import { Form } from "../../model";
import { ImageProcessor, Info, RecognitionResult } from "../../services/image-processor";

@Component({
	selector: 'ocr-selector',
	templateUrl: 'ocr-selector.html',
	animations: [
		trigger('isVisibleChanged', [
			state('true', style({ opacity: 1, "z-index": 1})),
			state('false', style({ opacity: 0, "z-index": -1 })),
			transition('* => *', animate('350ms'))
		])
	]
})
export class OcrSelector {

	@ViewChild(Content) 
	content: Content;

	private info: Info;

	private form: Form;

	image: string;

	@ViewChild('card') elementView: ElementRef;

	wordElements: Word[] = [];
	loading: boolean = true;
	isLoading = this.loading + "";
	changedValues:any = {};

	private result: RecognitionResult;

	private restrictedTypes: string[] = [
		"page_break",
		"section",
		"image",
		"business_card",
		"signature"
	]

	constructor(private params: NavParams,
				private viewCtrl: ViewController,
				private zone: NgZone,
				private actionSheetCtrl: ActionSheetController,
				private alertCtrl: AlertController,
				private imageProc: ImageProcessor) {
		this.info = params.get("imageInfo");
		this.form = params.get("form") || { "id": 42, "form_id": 42, "description": "This is your form description. Click here to edit.", "title": "Untitled Form", "list_id": 0, "name": "Device Form - Collector", "archive_date": "2017-05-22T12:41:00+00:00", "created_at": "2016-02-22T10:45:21+00:00", "updated_at": "2016-02-22T15:54:11+00:00", "success_message": "Success! Your submission has been saved!", "submit_error_message": "Form not submitted.", "submit_button_text": "Submit", "elements": [{ "id": 1, "title": "Name", "field_error_message": "", "size": "small", "is_required": false, "is_always_display": false, "is_conditional": false, "is_not_prefilled": false, "is_hidden": false, "is_readonly": false, "type": "simple_name", "position": 0, "default_value": "", "total_child": 1, "options": [], "mapping": [{ "ll_field_id": "17", "ll_field_unique_identifier": "LastName", "ll_field_type": "Standard", "ll_field_data_type": "string", "identifier": "element_1_1" }, { "ll_field_id": "16", "ll_field_unique_identifier": "FirstName", "ll_field_type": "Standard", "ll_field_data_type": "string", "identifier": "element_1_2" }], "identifier": "element_1" }, { "id": 2, "title": "Email", "field_error_message": "", "size": "medium", "is_required": false, "is_always_display": false, "is_conditional": false, "is_not_prefilled": false, "is_hidden": false, "is_readonly": false, "type": "email", "position": 1, "default_value": "", "total_child": 0, "options": [], "mapping": [{ "ll_field_id": "21", "ll_field_unique_identifier": "Email", "ll_field_type": "Standard", "ll_field_data_type": "string" }], "identifier": "element_2" }, { "id": 3, "title": "Company", "field_error_message": "", "size": "medium", "is_required": false, "is_always_display": false, "is_conditional": false, "is_not_prefilled": false, "is_hidden": false, "is_readonly": false, "type": "text", "position": 2, "default_value": "", "total_child": 0, "options": [], "mapping": [{ "ll_field_id": "22", "ll_field_unique_identifier": "Company", "ll_field_type": "Standard", "ll_field_data_type": "string" }], "identifier": "element_3" }], "total_submissions": 1, "total_hold": 0 };
		this.image = this.info.dataUrl;
	}

	ionViewDidEnter() {
		let z = this.zone;
		let t = this;
		setTimeout(() => {
			t.imageProc.recognize(t.info.dataUrl).subscribe((data) => {
				this.result = data;
				t.positionWords(data);
				t.loading = false;
				t.isLoading = t.loading + "";
			});
		}, 1);
	}

	@HostListener("window:resize", ["$event"])
	onResize(event){
		if(this.result){
			this.positionWords(this.result);
		}
	}

	positionWords(data: {
		recognizedText: string;
		words: {
			word: string;
			box: string;
			confidence: number;
		}[]
	}) {
		var wRatio =1; 100/this.info.width; //this.elementView.nativeElement.width / this.info.width;
		var hRatio =1; 100/this.info.height; //this.elementView.nativeElement.height / this.info.height;
		var ratio = this.elementView.nativeElement.width / this.info.width;
		let list: Word[] = [];
		let w: Word;
		let uom = "px";
		data.words.forEach(element => {
			w = new Word();
			w.word = element.word;
			w.confidence = element.confidence;
			var coords = element.box.split(" ");
			w.left = (parseFloat(coords[0]) * ratio - 2) + uom;
			w.top = (parseFloat(coords[1]) * ratio - 2) + uom;
			w.width = (parseFloat(coords[2]) * ratio + 4) + uom;
			w.height = (parseFloat(coords[3]) * ratio + 4) + uom;
			list.push(w);
		});
		this.wordElements = list;
	}

	wordClicked(word: Word) {
		let actionSheet = this.actionSheetCtrl.create({
			title: word.word,
			cssClass: "word-actions",
			subTitle: word.assigned ? "Assigned to field " + word.assigned.label : "Not assigned to a field",
			buttons: [
				{
					text: 'Edit',
					icon: "create",
					handler: () => {
						let alert = this.alertCtrl.create({
							title: '<i class="pull-left icon icon-md ion-md-create"></i>  ' + word.word,
							cssClass: "edit-word",
							inputs: [
								{
									name: 'word',
									placeholder: 'word',
									value: word.word
								}
							],
							buttons: [
								{
									text: 'Cancel',
									role: 'cancel',
									handler: data => {
										console.log('Cancel clicked');
									}
								},
								{
									text: 'Update',
									handler: data => {
										word.word = data.word;
										actionSheet.setTitle(word.word);
									}
								}
							]
						});
						alert.present();
						return false;
					}
				}, {
					text: word.assigned ? 'Assign to another field' : 'Assign to field',
					icon: "eye",
					handler: () => {
						//console.log('review clicked');
						let inputs = [];
						let nameMap = {
							"FirstName": "First Name",
							"LastName": "Last Name"
						}
						this.form.elements.forEach(element => {
							if(this.restrictedTypes.indexOf(element.type) > -1){
								return;
							}
							if(element.mapping && element.mapping.length > 1){								
								element.mapping.forEach(mapping => {
									inputs.push({
									type: 'radio',
									label: nameMap[mapping.ll_field_unique_identifier] || mapping.ll_field_unique_identifier,
									value: mapping["identifier"]
								});
								})
							}else{
								inputs.push({
									type: 'radio',
									label: element.title,
									value: element["identifier"]
								});
							}
						});
						console.log(inputs);
						inputs[0].checked = true;
						let alert = this.alertCtrl.create({
							title: '<i class="pull-left icon icon-md ion-md-eye"></i>  ' + word.word,
							//subTitle: "Assign to field",
							cssClass: "assign-field",
							inputs: inputs,
							buttons: [
								{
									text: 'Cancel',
									role: 'cancel',
									handler: data => {
										console.log('Cancel clicked');
									}
								},
								{
									text: 'Update',
									handler: data => {
										if (data) {
											var title = "";
											for (let i = 0; i < this.form.elements.length; i++) {
												if (this.form.elements[i]["identifier"] == data) {
													title = this.form.elements[i].title;
													break;
												}
											}
											this.changedValues[data] = word.word;
											word.assigned = new Assigned(data, title);
										}
									}
								}
							]
						});
						alert.present();
					}
				}, {
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						//console.log('Cancel clicked');
					}
				}
			]
		});
		actionSheet.present();
	}

	cancel() {
		this.viewCtrl.dismiss(null);
	}

	done() {
		this.viewCtrl.dismiss(this.changedValues);
	}
}

class Word {
	word: string;
	width: string|number;
	height: string|number;
	top: string|number;
	left: string|number;
	confidence: number;
	assigned: Assigned;
}

class Assigned {
	field: string;
	label: string;

	constructor(field: string, label: string) {
		this.label = label;
		this.field = field;
	}
}