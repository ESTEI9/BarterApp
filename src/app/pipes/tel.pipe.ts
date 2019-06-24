import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tel'
})
export class TelPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    //Ex. 0123456789 => (012) 345-6789
    return `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
  }

}
