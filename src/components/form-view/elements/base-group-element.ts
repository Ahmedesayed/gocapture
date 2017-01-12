import { SimpleChange } from '@angular/core';
import { FormElement } from "../../../model";
import { AbstractControl, FormGroup } from "@angular/forms";

export class BaseGroupElement {

	element: FormElement;
	
	rootGroup: FormGroup;

	mapping = [];

	group: FormGroup = new FormGroup({});

	constructor() {

	}

	ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
		console.log("group", this.element, this.group, this.rootGroup);
		if (changes['element'] || changes['rootGroup']){
			this.config();
		}
	}

	protected config(){
		if(this.element && this.element.mapping && this.rootGroup){
			let elemIdentifier = "element_" + this.element.id;
			this.group = <FormGroup> this.rootGroup.get(elemIdentifier);
			this.element.mapping.forEach((map, index)=>{
				this.mapping.push({
					id: index+1,
					identifier: elemIdentifier + "_" + (index+1),
					label: map.ll_field_unique_identifier
				})
			});
		}
	}
}