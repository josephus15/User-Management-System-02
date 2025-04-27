import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);

export const routes: Routes = [
    // Home route with protection
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    
    // Default route goes to home (which will redirect to login if not authenticated)
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    
    // Account module for login/register
    { path: 'account', loadChildren: accountModule },
    
    // Protected routes
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
    
    // Catch all route - goes to home
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }