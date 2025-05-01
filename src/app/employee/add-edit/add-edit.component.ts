import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { EmployeeService, DepartmentService, AccountService, AlertService } from '@app/_services';
import { Account, Department } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id!: number;
    isAddMode!: boolean;
    loading = false;
    submitted = false;
    accounts: Account[] = [];
    departments: Department[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private departmentService: DepartmentService,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        // Load accounts and departments
        this.loadAccounts();
        this.loadDepartments();
        
        this.form = this.formBuilder.group({
            accountId: ['', Validators.required],
            employeeId: ['', [Validators.required, Validators.maxLength(20)]],
            position: ['', [Validators.required, Validators.maxLength(100)]],
            departmentId: ['', Validators.required],
            hireDate: ['', Validators.required],
            status: ['Active', Validators.required]
        });

        if (!this.isAddMode) {
            this.loading = true;
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe(
                    employee => {
                        // Format date as YYYY-MM-DD for input type="date"
                        const hireDate = employee.hireDate 
                            ? new Date(employee.hireDate).toISOString().split('T')[0]
                            : '';
                            
                        this.form.patchValue({
                            ...employee,
                            hireDate
                        });
                        this.loading = false;
                    },
                    error => {
                        this.alertService.error('Error loading employee: ' + error);
                        this.loading = false;
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                );
        }
    }

    private loadAccounts() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(
                accounts => this.accounts = accounts,
                error => this.alertService.error('Error loading accounts: ' + error)
            );
    }

    private loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(
                departments => this.departments = departments,
                error => this.alertService.error('Error loading departments: ' + error)
            );
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
            this.createEmployee();
        } else {
            this.updateEmployee();
        }
    }

    private createEmployee() {
        this.employeeService.create(this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Employee added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error adding employee: ' + error);
                    this.loading = false;
                }
            );
    }

    private updateEmployee() {
        this.employeeService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Employee updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error updating employee: ' + error);
                    this.loading = false;
                }
            );
    }
}