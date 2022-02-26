import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class FileReaderService {

    constructor(private http: HttpClient) {
    }

    readWordList(): Observable<string> {
        return this.http.get('assets/sgb-words.txt', {responseType: 'text'});
    }

}
