import {Component, View} from 'angular2/angular2';

import { _settings } from '../../settings'
import {Header} from '../../components/header/header'

@Component({
    selector: 'app'
})
@View({
    templateUrl: _settings.pagesPath + '/app/app.html',
    directives: [Header]
})
export class App {
}