import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { PokemonResponse } from '../pokemon.model';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
})
export class PokemonComponent implements OnInit {
  @Input() url!: string;

  pokemon?: PokemonResponse;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<PokemonResponse>(this.url)
      .pipe(tap((pokemon) => (this.pokemon = pokemon)))
      .subscribe();
  }
}
