import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, from, lastValueFrom, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { BoppinState } from './boppin-state';
import {
  PaginatePokemon,
  PaginatePokemonResponse,
} from './paginate-pokemon.model';
import { PokemonResponse } from './pokemon.model';
interface AppState {
  limit: number;
  offset: number;
  count: number;
  totalPage: number;
  currentPage: number;
  paginatePokemons: PaginatePokemon[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [BoppinState],
})
export class AppComponent {
  title = 'youtubeRxState';

  limit$ = this.store.select((state) => state.limit);
  offset$ = this.store.select((state) => state.offset);
  count$ = this.store.select((state) => state.count);
  totalPage$ = this.store.select((state) => state.totalPage);
  currentPage$ = this.store.select((state) => state.currentPage);
  paginatePokemons$ = this.store.select((state) => state.paginatePokemons);

  limitFormControl = new FormControl(10);

  constructor(private store: BoppinState<AppState>, private http: HttpClient) {
    this.store.set({ limit: this.limitFormControl.value, offset: 0 });

    this.store.hold(
      combineLatest({ offset: this.offset$, limit: this.limit$ }).pipe(
        tap(({ limit, offset }) => {
          const currentPage = (offset + limit) / limit;
          this.store.set({
            currentPage,
          });
        })
      )
    );

    this.store.hold(
      this.limitFormControl.valueChanges.pipe(
        tap((limit) => {
          this.store.set({ limit: Number(limit) });
        })
      )
    );

    this.store.hold(
      combineLatest({ count: this.count$, limit: this.limit$ }).pipe(
        tap(({ count, limit }) => {
          const totalPage = Math.ceil(count / limit);
          this.store.set({
            totalPage,
          });
        })
      )
    );

    this.store.hold(
      combineLatest({ limit: this.limit$, offset: this.offset$ }).pipe(
        switchMap(({ limit, offset }) => {
          return this.http.get<PaginatePokemonResponse>(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
          );
        }),
        tap((response) => {
          this.store.set({
            count: response.count,
            paginatePokemons: response.results,
          });
        })
      )
    );
  }

  prevPage() {
    const limit = this.store.get('limit');
    const offset = this.store.get('offset');
    if (offset - limit >= 0) {
      this.store.set({
        offset: offset - limit,
      });
    }
  }

  nextPage() {
    const limit = this.store.get('limit');
    const offset = this.store.get('offset');
    this.store.set({
      offset: limit + offset,
    });
  }
}
