// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from './_services';
import { User, Role } from './_models'; // Change Account to User
import { AlertComponent } from './components/alert.component';

@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AlertComponent
  ]
})
export class AppComponent {
  Role = Role;
  user?: User | null; // Change account to user and adjust type

  constructor(private accountService: AccountService) {
    this.accountService.user.subscribe(x => this.user = x);
  }

  logout() {
    this.accountService.logout();
  }
}