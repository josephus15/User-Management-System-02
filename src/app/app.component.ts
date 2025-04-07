import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AlertComponent } from './components/alert.component';
import { AccountService } from './_services/account.service';
import { Role } from './_models/role';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, HttpClientModule, AlertComponent]
})
export class AppComponent implements OnInit {
    account: any;
    Role = Role;

    constructor(
        private accountService: AccountService,
        private router: Router
    ) {
        this.accountService.account.subscribe(x => {
            console.log('Account updated:', x);
            this.account = x;
        });
    }

    ngOnInit() {
        // Log navigation events to debug routing
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            console.log('Navigation completed:', event.url);
        });
        
        // Force navigation to account/login
        console.log('Navigating to account/login...');
        this.router.navigate(['account/login']);
    }

    logout() {
        this.accountService.logout();
    }
}