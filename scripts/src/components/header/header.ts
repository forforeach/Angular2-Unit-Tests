import {Component, View, NgFor} from 'angular2/angular2';

import { _settings } from '../../settings';


@Component({
    selector: 'header'
})
@View({
    templateUrl: _settings.buildPath + '/components/header/header.html',
    directives: [NgFor]
})
export class Header {
    names: Array<string>;

    constructor() {
        this.names = new Array<string>();
    }

    addName(name: string) {
        this.names.push(name);
    }
}