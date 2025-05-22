import { Component, OnInit } from '@angular/core';
import { FileReaderService } from './services/file-reader.service';
import { RankedLetter } from './model/ranked-letter';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [FormsModule, NgFor],
})
export class AppComponent implements OnInit {
  allWords: string[] = [];
  excludedLetters: string = '';
  suggestedWords: string[] = [];
  knownLetterOne: string = '';
  knownLetterTwo: string = '';
  knownLetterThree: string = '';
  knownLetterFour: string = '';
  knownLetterFive: string = '';
  misplacedLetterOne: string = '';
  misplacedLetterTwo: string = '';
  misplacedLetterThree: string = '';
  misplacedLetterFour: string = '';
  misplacedLetterFive: string = '';
  mostLikelyWord: string = '';
  rankedLetters: RankedLetter[] = [];
  nonRepeatedLetters: string = '';

  constructor(private service: FileReaderService) {}

  ngOnInit() {
    this.service.readWordList().subscribe({
      next: (words) => {
        this.allWords = words.split('\n');
        this.rankAllLetters();
        this.suggestWords();
      },
    });
  }

  private rankAllLetters(): void {
    this.buildRankingBase();
    this.mostLikelyWord = '';
    for (const letter of this.rankedLetters) {
      const filtered = this.allWords.filter((word) => word.substring(letter.index - 1, letter.index) === letter.letter);
      letter.score = filtered.length;
    }
  }

  private getWordScore(entry: string): number {
    let score: number = 0;
    for (let index = 0; index < 5; index++) {
      const letter = entry.substring(index, index + 1);
      const filtered = this.rankedLetters.filter((rankedLetter) => rankedLetter.index === index && rankedLetter.letter === letter);
      score += filtered[0]?.score || 0;
    }
    const distinctLetterCount = new Set(entry.split('')).size;
    return score * distinctLetterCount;
  }

  private buildRankingBase(): void {
    const alphabet: string[] = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];
    const indices: number[] = [1, 2, 3, 4, 5];
    this.rankedLetters = [];
    for (const letter of alphabet) {
      for (const index of indices) {
        const rankedLetter = new RankedLetter();
        rankedLetter.letter = letter;
        rankedLetter.index = index;
        rankedLetter.score = 0;
        this.rankedLetters.push(rankedLetter);
      }
    }
  }

  suggestWords(): void {
    this.suggestedWords = [];
    if (this.allWords && this.allWords.length > 0) {
      let filtered: string[] = JSON.parse(JSON.stringify(this.allWords));
      if (this.excludedLetters && this.excludedLetters.length > 0) {
        const excluded = this.excludedLetters
          .split(',')
          .filter((letter) => letter && letter.length > 0)
          .map((letter) => letter.trim().substring(0, 1));
        filtered = filtered.filter((word) => !excluded.some((letter) => word.indexOf(letter) >= 0));
      }
      filtered = this.filterKnown(filtered, 0, 1, this.knownLetterOne);
      filtered = this.filterKnown(filtered, 1, 2, this.knownLetterTwo);
      filtered = this.filterKnown(filtered, 2, 3, this.knownLetterThree);
      filtered = this.filterKnown(filtered, 3, 4, this.knownLetterFour);
      filtered = this.filterKnown(filtered, 4, 5, this.knownLetterFive);
      filtered = this.filterMisplaced(filtered, 0, this.misplacedLetterOne);
      filtered = this.filterMisplaced(filtered, 1, this.misplacedLetterTwo);
      filtered = this.filterMisplaced(filtered, 2, this.misplacedLetterThree);
      filtered = this.filterMisplaced(filtered, 3, this.misplacedLetterFour);
      filtered = this.filterMisplaced(filtered, 4, this.misplacedLetterFive);
      if (this.nonRepeatedLetters && this.nonRepeatedLetters.length > 0) {
        const nonRepeating = this.nonRepeatedLetters
          .split(',')
          .filter((letter) => letter && letter.length > 0)
          .map((letter) => letter.trim().substring(0, 1));
        filtered = filtered.filter((word) => !nonRepeating.some((letter) => (word.match(new RegExp(letter, 'g')) || []).length > 1));
      }
      this.suggestedWords = this.sortFilteredResults(filtered);
    }
  }

  private sortFilteredResults(filtered: string[]): string[] {
    return filtered.sort((first, second) => this.getWordScore(second) - this.getWordScore(first));
  }

  private filterKnown(filtered: string[], startIndex: number, endIndex: number, value: string): string[] {
    if (value && value.length > 0) {
      return filtered.filter((word) => word.substring(startIndex, endIndex) === value);
    }
    return filtered;
  }

  private filterMisplaced(filtered: string[], index: number, value: string): string[] {
    if (value && value.length > 0) {
      const misplaced = value
        .split(',')
        .filter((letter) => letter && letter.length > 0)
        .map((letter) => letter.trim().substring(0, 1));
      for (const letter of misplaced) {
        filtered = filtered.filter((word) => {
          if (word.substring(index, index + 1) === letter) {
            return false;
          } else {
            return word.indexOf(letter) >= 0;
          }
        });
      }
    }
    return filtered;
  }
}
