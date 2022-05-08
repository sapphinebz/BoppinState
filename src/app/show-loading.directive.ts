import { Directive, ElementRef, ViewContainerRef } from '@angular/core';
import { first, from, fromEvent, merge, race, timer, zip } from 'rxjs';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

@Directive({
  selector: '[appShowLoading]',
})
export class ShowLoadingDirective {
  constructor(
    private vc: ViewContainerRef,
    private el: ElementRef<HTMLElement>
  ) {
    const componentRef = this.vc.createComponent(LoadingSpinnerComponent);
    this.el.nativeElement.hidden = true;
    const load$ = fromEvent(this.el.nativeElement, 'load');
    const error$ = fromEvent(this.el.nativeElement, 'error');
    const loadedImage$ = race(load$, error$).pipe(first());
    zip([loadedImage$, timer(400)])
      .pipe(first())
      .subscribe(() => {
        this.el.nativeElement.hidden = false;
        componentRef.destroy();
      });
  }
}
