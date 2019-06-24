import { NgModule } from '@angular/core';
import { TelPipe } from './tel.pipe';

@NgModule({
    declarations: [
        TelPipe
    ],
    imports: [],
    exports: [
        TelPipe
    ]
})

export class PipesModule {}