import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { DepartmentService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;  // Added non-null assertion operator
    id!: number;       // Added non-null assertion operator
    isAddMode!: boolean; // Added non-null assertion operator
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        this.form = this.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)]
        });

        if (!this.isAddMode) {
            this.loading = true;
            this.departmentService.getById(this.id)
                .pipe(first())
                .subscribe(
                    department => {
                        this.form.patchValue(department);
                        this.loading = false;
                    },
                    error => {
                        this.alertService.error('Error loading department: ' + error);
                        this.loading = false;
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                );
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createDepartment();
        } else {
            this.updateDepartment();
        }
    }

    private createDepartment() {
        this.departmentService.create(this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Department added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error adding department: ' + error);
                    this.loading = false;
                }
            );
    }

    private updateDepartment() {
        this.departmentService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Department updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error updating department: ' + error);
                    this.loading = false;
                }
            );
    }
}