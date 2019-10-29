import { NgModule } from '@angular/core';
import { TelPipe } from './tel.pipe';
import { DateTimePipe } from './date-time.pipe';

@NgModule({
    declarations: [
        TelPipe,
        DateTimePipe
    ],
    imports: [],
    exports: [
        TelPipe,
        DateTimePipe
    ]
})

export class PipesModule {}
