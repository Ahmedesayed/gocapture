import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from "./safe-html/safe-html";
import { SubmissionStatusPipe } from './submission-status/submission-status';
import { FormControlPipe } from './form-control-pipe';
import { AvatarPathUpdaterPipe } from './avatar-path-updater';
import { ArrayFilterPipe } from './filter-pipe';
import { TimeIntervalPipe } from './time-interval-pipe';
import {ConvertFileSrcPipe} from "./convert-file-src-pipe";
@NgModule({
	declarations: [
		SafeHtmlPipe,
		SubmissionStatusPipe,
		FormControlPipe,
		AvatarPathUpdaterPipe,
		ArrayFilterPipe,
		TimeIntervalPipe,
    ConvertFileSrcPipe
	],
	imports: [],
	exports: [
		SafeHtmlPipe,
		SubmissionStatusPipe,
		FormControlPipe,
		AvatarPathUpdaterPipe,
		ArrayFilterPipe,
		TimeIntervalPipe,
    ConvertFileSrcPipe
	]
})
export class PipesModule { }
