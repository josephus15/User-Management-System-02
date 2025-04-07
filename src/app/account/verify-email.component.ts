import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { first, finalize } from 'rxjs/operators';
import { AlertService } from '../_services';
import { AccountService } from '../_services/account.service';

enum EmailStatus {
    Verifying = 'Verifying',
    Failed = 'Failed',
    Success = 'Success'
}

@Component({ 
    templateUrl: 'verify-email.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class VerifyEmailComponent implements OnInit {
    EmailStatus = EmailStatus; // Make enum available in template
    emailStatus: EmailStatus = EmailStatus.Verifying;
    loading = true;
    token: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {
        // Log all parameters for debugging
        console.log('Constructor - route params:', this.route.snapshot.queryParams);
    }

    ngOnInit() {
        // Try different ways to get the token
        this.token = this.route.snapshot.queryParams['token'] || '';
        
        console.log('Verify Email Component Initialized');
        console.log('Token from URL:', this.token);
        
        if (!this.token) {
            console.error('No token found in URL');
            this.emailStatus = EmailStatus.Failed;
            this.alertService.error('Verification failed: No token provided');
            this.loading = false;
            return;
        }

        // Do NOT remove the token from the URL yet
        console.log('About to call verifyEmail with token:', this.token);
        this.verifyEmail(this.token);
    }
    
    verifyEmail(token: string) {
        console.log('Calling API to verify email with token:', token);
        
        this.accountService.verifyEmail(token)
            .pipe(
                first(),
                finalize(() => {
                    console.log('API call completed');
                    this.loading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    console.log('Verification successful:', response);
                    this.emailStatus = EmailStatus.Success;
                    this.alertService.success('Email verification successful, you can now login', { keepAfterRouteChange: true });
                    
                    // Wait 2 seconds before redirecting so user can see success message
                    setTimeout(() => {
                        this.router.navigate(['../login'], { relativeTo: this.route });
                    }, 2000);
                },
                error: (error) => {
                    console.error('Verification failed:', error);
                    this.emailStatus = EmailStatus.Failed;
                    this.alertService.error('Verification failed: ' + (error.error?.message || error.message || 'Unknown error'));
                }
            });
    }
    
    // For testing - allow manual verification
    manualVerify() {
        console.log('Manual verification with token:', this.token);
        this.loading = true;
        this.emailStatus = EmailStatus.Verifying;
        this.verifyEmail(this.token);
    }
}