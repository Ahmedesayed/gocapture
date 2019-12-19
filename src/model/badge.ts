import { BaseResponse } from './protocol';
export class ItemData{
	ll_field_id: string;
	ll_field_unique_identifier: string;
	value: string;
}

export class BadgeResponse extends BaseResponse{
	public info: ItemData[];
}
