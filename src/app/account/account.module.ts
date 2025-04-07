import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { VerifyEmailComponent } from './verify-email.component';
import { ResetPasswordComponent } from './reset-password.component';
import { ForgotPasswordComponent } from './forgot-password.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AccountRoutingModule,
        // Import standalone components here
        LayoutComponent,
        LoginComponent,
        RegisterComponent,
        VerifyEmailComponent,
        ResetPasswordComponent,
        ForgotPasswordComponent
    ],
    declarations: [
        // No declarations for standalone components
    ]
})
export class AccountModule {}