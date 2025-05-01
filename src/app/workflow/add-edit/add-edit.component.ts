import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, EmployeeService, AlertService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id!: number;
    isAddMode!: boolean;
    loading = false;
    submitted = false;
    employees: Employee[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        this.loadEmployees();
        
        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required],
            type: ['', Validators.required],
            description: ['']
        });

        // Pre-populate employee if passed as query parameter
        const employeeId = this.route.snapshot.queryParams['employeeId'];
        if (employeeId) {
            this.form.patchValue({ employeeId });
        }

        if (!this.isAddMode) {
            this.loading = true;
            this.workflowService.getById(this.id)
                .pipe(first())
                .subscribe(
                    workflow => {
                        this.form.patchValue(workflow);
                        this.loading = false;
                    },
                    error => {
                        this.alertService.error('Error loading workflow: ' + error);
                        this.loading = false;
                        this.router.navigate(['../'], { relativeTo: this.route });
                    }
                );
        }
    }

    private loadEmployees() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(
                employees => this.employees = employees,
                error => this.alertService.error('Error loading employees: ' + error)
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
            this.createWorkflow();
        } else {
            this.updateWorkflow();
        }
    }

    private createWorkflow() {
        this.workflowService.create(this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Workflow added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error adding workflow: ' + error);
                    this.loading = false;
                }
            );
    }

    private updateWorkflow() {
        this.workflowService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Workflow updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error updating workflow: ' + error);
                    this.loading = false;
                }
            );
    }
}