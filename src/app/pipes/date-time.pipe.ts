import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {

  transform(time: any, args?: any): Date {
    const newDate = new Date(time);
    newDate.setHours(newDate.getHours() + 5 - newDate.getTimezoneOffset() / 60); // Because DB is set to CST
    newDate.toLocaleString('en-US', {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone});

    return new Date(newDate);
  }

}
