import { Injectable, OnDestroy } from '@angular/core';
import {
  AsyncSubject,
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  shareReplay,
  takeUntil,
} from 'rxjs';

type Selector<T, R> = (state: T) => R;
@Injectable()
export class BoppinState<T> implements OnDestroy {
  $ = new BehaviorSubject<T>({} as T);

  private onDestroy$ = new AsyncSubject<void>();
  constructor() {}

  set(partial: Partial<T>): void {
    this.$.next({ ...this.$.getValue(), ...partial });
  }

  hold(effect$: Observable<any>) {
    effect$.pipe(takeUntil(this.onDestroy$)).subscribe();
  }

  get<KEY extends keyof T>(keyState: KEY): T[KEY] {
    return this.$.getValue()[keyState];
  }

  // connect<KEY extends keyof T>(
  //   keyState: KEY,
  //   valueChange: Observable<T[KEY]>
  // ): void {
  //   valueChange.pipe(takeUntil(this.onDestroy$)).subscribe((state) => {
  //     const newState = { ...this.$.getValue() };
  //     newState[keyState] = state;
  //     this.$.next(newState);
  //   });
  // }

  select<R>(selector: Selector<T, R>): Observable<R> {
    return this.$.pipe(
      map((state) => {
        let stateSlice: R | T[keyof T];

        stateSlice = selector(state);
        return stateSlice;
      }),
      filter((state) => state !== undefined),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
