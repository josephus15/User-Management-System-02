import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { RequestService, EmployeeService, AlertService } from '@app/_services';
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
        private requestService: RequestService,
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
            description: [''],
            items: this.formBuilder.array([])
        });

        // Add at least one item field by default for new requests
        if (this.isAddMode) {
            this.addItem();
        }

        // Pre-populate employee if passed as query parameter
        const employeeId = this.route.snapshot.queryParams['employeeId'];
        if (employeeId) {
            this.form.patchValue({ employeeId });
        }

        if (!this.isAddMode) {
            this.loading = true;
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe(
                    request => {
                        this.form.patchValue({
                            employeeId: request.employeeId,
                            type: request.type,
                            description: request.description
                        });
                        
                        // Clear and add items from the request
                        this.items.clear();
                        if (request.requestItems && request.requestItems.length) {
                            request.requestItems.forEach(item => {
                                this.items.push(this.formBuilder.group({
                                    id: [item.id],
                                    name: [item.name, [Validators.required, Validators.maxLength(100)]],
                                    description: [item.description],
                                    quantity: [item.quantity, [Validators.required, Validators.min(1)]]
                                }));
                            });
                        } else {
                            this.addItem();
                        }
                        
                        this.loading = false;
                    },
                    error => {
                        this.alertService.error('Error loading request: ' + error);
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

    // convenience getters
    get f() { return this.form.controls; }
    get items() { return this.form.get('items') as FormArray; }
    
    // add new item to the form
    addItem() {
        this.items.push(this.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: [''],
            quantity: [1, [Validators.required, Validators.min(1)]]
        }));
    }
    
    // remove item from the form
    removeItem(index: number) {
        if (this.items.length > 1) {
            this.items.removeAt(index);
        } else {
            this.alertService.error('At least one item is required');
        }
    }

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
            this.createRequest();
        } else {
            this.updateRequest();
        }
    }

    private createRequest() {
        this.requestService.create(this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Request added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error adding request: ' + error);
                    this.loading = false;
                }
            );
    }

    private updateRequest() {
        this.requestService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Request updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error => {
                    this.alertService.error('Error updating request: ' + error);
                    this.loading = false;
                }
            );
    }
}