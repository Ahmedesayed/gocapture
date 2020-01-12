import { NgModule } from '@angular/core';
import { SafeHtmlPipe } from "./safe-html/safe-html";
import { SubmissionStatusPipe } from './submission-status/submission-status';
import { FormControlPipe } from './form-control-pipe';
import { AvatarPathUpdaterPipe } from './avatar-path-updater';
import { ArrayFilterPipe } from './filter-pipe';
import { TimeIntervalPipe } from './time-interval-pipe';
import { ConvertFileSrcPipe } from "./convert-file-src-pipe";
import { SortByPipe } from './sort-by/sort-by';
import { FirstLetterPipe } from './first-letter/first-letter';
import { SafeUrlPipe } from './safe-url/safe-url';
@NgModule({
	declarations: [
		SafeHtmlPipe,
		SubmissionStatusPipe,
		FormControlPipe,
		AvatarPathUpdaterPipe,
		ArrayFilterPipe,
		TimeIntervalPipe,
		ConvertFileSrcPipe,
		SortByPipe,
		FirstLetterPipe,
		SafeUrlPipe
	],
	imports: [],
	exports: [
		SafeHtmlPipe,
		SubmissionStatusPipe,
		FormControlPipe,
		AvatarPathUpdaterPipe,
		ArrayFilterPipe,
		TimeIntervalPipe,
		ConvertFileSrcPipe,
		SortByPipe,
		FirstLetterPipe,
		SafeUrlPipe
	]
})
export class PipesModule { }
