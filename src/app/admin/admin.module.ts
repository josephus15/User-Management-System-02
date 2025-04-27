// src/app/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        AdminRoutingModule,
        // Import standalone components
        SubNavComponent,
        LayoutComponent,
        OverviewComponent
    ]
    // No declarations since they are standalone components
})
export class AdminModule { }