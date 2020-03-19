import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FirstLetterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'firstLetter',
})
export class FirstLetterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    if(value) return value.charAt(0).toUpperCase();
  }
}