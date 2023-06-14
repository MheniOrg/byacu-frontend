import { Component, Input, SimpleChanges } from '@angular/core';
import { User } from '../user';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.css']
})
export class UserDisplayComponent {
  @Input() user!: User;
  menuOpen: boolean = false;

  constructor(private _router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log(changes);
  }

  menuClick(): void {
    this.menuOpen = !this.menuOpen;
  }

  navigateToHome() {

    this._router.navigateByUrl('/')

  }

  SignOut(): void {
    localStorage.removeItem('oauth2-test-params');
    this.navigateToHome();
  }
}
