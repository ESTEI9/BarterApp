import { Component, OnInit, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { IonRefresher } from '@ionic/angular';

@Component({
  selector: 'ion-md-refresher',
  templateUrl: './ion-md-refresher.component.html',
  styleUrls: ['./ion-md-refresher.component.scss'],
})
export class IonMdRefresherComponent implements OnInit {

  @ViewChild('container') container: ElementRef;
  @ViewChild('spinner') spinner: ElementRef;
  @ViewChild('refresher') refresher: IonRefresher;

  @Output() doRefresh: EventEmitter<any> = new EventEmitter();

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit() {}

  checkProgress() {
    this.refresher.getProgress().then((progress: number) => {
        if (progress < 1) {
            this.renderer.removeStyle(this.container.nativeElement, 'max-height');
            this.renderer.removeStyle(this.container.nativeElement, 'width');
            this.renderer.addClass(this.container.nativeElement, 'hidden');
            this.renderer.removeStyle(this.spinner.nativeElement, 'transform');
        }
    });
}

returnProgress() {
    this.refresher.getProgress().then((progress: number) => {
        const percent = progress < 1 ? progress : 1;
        if (percent === 1) {
            this.renderer.removeClass(this.container.nativeElement, 'hidden');
            this.renderer.removeStyle(this.container.nativeElement, 'max-height');
            this.renderer.removeStyle(this.container.nativeElement, 'width');
            this.renderer.addClass(this.spinner.nativeElement, 'running');
            this.renderer.removeStyle(this.spinner.nativeElement, 'transform');
        } else {
            this.renderer.setStyle(this.container.nativeElement, 'max-height', `${40 * percent}px`);
            this.renderer.setStyle(this.container.nativeElement, 'width', `${40 * percent}px`);
            this.renderer.setStyle(this.spinner.nativeElement, 'transform', `rotate(${360 * percent}deg)`);
        }
    });
}

refresh() {
    this.refresher.complete().then(() => {
        this.doRefresh.emit(null);
        setTimeout(() => {
            this.renderer.addClass(this.container.nativeElement, 'hidden');
            this.renderer.removeClass(this.spinner.nativeElement, 'running');
            this.renderer.removeStyle(this.spinner.nativeElement, 'transform');
        }, 1000);
    });
}

}
