import {FormElement} from "./form-element";
import {BaseForm} from "./base-form";

export class Form extends BaseForm{
	created_at : string;
	updated_at : string;
	archive_date : string;
	list_id : number;
	title : string;
	success_message : string;
	submit_error_message : string;
	total_views : number;
	submit_button_text : string;
	elements : FormElement[];

	public static getIdByUniqueFieldName(name : string, form: any) : string{
		let element : FormElement = null;
		for(let i = 0; i < form.elements.length; i++){
			element = form.elements[i];
			if(!element.mapping || element.mapping.length == 0){
				continue;
			}
			if(element.mapping.length == 1){
				if(element.mapping[0].ll_field_unique_identifier == name){
					return element["identifier"];
				}
				continue;
			}
			for(let j = 0; j < element.mapping.length; j++){
				if(element.mapping[j].ll_field_unique_identifier == name){
					return element.mapping[j]["identifier"];
				}
			}
		}
		return null;
	}

	public getUrlFields() : string[]{
		let res = [];
		let types = ["business_card", "image", "signature"];
		let element : FormElement = null;
		for(let i = 0; i < this.elements.length; i++){
			element = this.elements[i];
			if(types.indexOf(element.type) > -1){
				res.push(element["identifier"]);
			}
		}
		return res;
	}

	public getIdByUniqueFieldName(name : string) : string{
		return Form.getIdByUniqueFieldName(name, this);
	}

	public computeIdentifiers(){
		this.elements.forEach((element)=>{
			if(element["identifier"]){
				return;
			}
			var identifier = "element_" + element.id;
			element["identifier"] = identifier;
			if(element.mapping.length > 1){
				element.mapping.forEach((entry, index) =>{
					entry["identifier"] = identifier + "_" + (index+1);
				});
			}
		});
	}
}