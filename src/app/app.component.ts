import {Component, OnInit} from '@angular/core';
import {FileReaderService} from './file-reader.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
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

    constructor(private service: FileReaderService) {
    }

    ngOnInit() {
        this.service.readWordList().subscribe({
            next: (words) => {
                this.allWords = words.split('\n');
            },
        });
    }

    suggestWords(): void {
        this.suggestedWords = [];
        if (this.allWords && this.allWords.length > 0) {
            let filtered: string[] = JSON.parse(JSON.stringify(this.allWords));
            if (this.excludedLetters && this.excludedLetters.length > 0) {
                const excluded = this.excludedLetters.split(',').filter(letter => letter && letter.length > 0)
                    .map(letter => letter.trim().substring(0, 1));
                filtered = filtered.filter(word => !excluded.some(letter => word.indexOf(letter) >= 0));
            }
            filtered = this.filterKnown(filtered, 0, 1, this.knownLetterOne);
            filtered = this.filterKnown(filtered, 1, 2, this.knownLetterTwo);
            filtered = this.filterKnown(filtered, 2, 3, this.knownLetterThree);
            filtered = this.filterKnown(filtered, 3, 4, this.knownLetterFour);
            filtered = this.filterKnown(filtered, 4, 5, this.knownLetterFive);
            filtered = this.filterMisplaced(filtered, 0, 1, this.misplacedLetterOne);
            filtered = this.filterMisplaced(filtered, 1, 2, this.misplacedLetterTwo);
            filtered = this.filterMisplaced(filtered, 2, 3, this.misplacedLetterThree);
            filtered = this.filterMisplaced(filtered, 3, 4, this.misplacedLetterFour);
            filtered = this.filterMisplaced(filtered, 4, 5, this.misplacedLetterFive);
            this.suggestedWords = filtered;
        }
    }

    private filterKnown(filtered: string[], startIndex: number, endIndex: number, value: string): string[] {
        if (value && value.length > 0) {
            return filtered.filter(word => word.substring(startIndex, endIndex) === value);
        }
        return filtered;
    }

    private filterMisplaced(filtered: string[], startIndex: number, endIndex: number, value: string): string[] {
        if (value && value.length > 0) {
            const misplaced = value.split(',').filter(letter => letter && letter.length > 0)
                .map(letter => letter.trim().substring(0, 1));
            return filtered.filter(word => misplaced.some(letter => word.indexOf(letter) >= 0 && word.substring(startIndex, endIndex) !== letter));
        }
        return filtered;
    }

}
