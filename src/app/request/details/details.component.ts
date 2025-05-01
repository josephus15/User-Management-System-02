import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { RequestService, AlertService } from '@app/_services';
import { Request } from '@app/_models';

@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent implements OnInit {
    id!: number;
    request!: Request;
    statusForm!: FormGroup;
    loading = true;
    updating = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.statusForm = this.formBuilder.group({
            status: ['', Validators.required],
            description: ['']
        });
        
        this.loadRequestDetails();
    }

    private loadRequestDetails() {
        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe(
                (request: Request) => {
                    this.request = request;
                    this.statusForm.patchValue({
                        status: request.status,
                        description: request.description
                    });
                    this.loading = false;
                },
                (error: any) => {
                    this.alertService.error('Error loading request details: ' + error);
                    this.loading = false;
                    this.router.navigate(['../../'], { relativeTo: this.route });
                }
            );
    }

    // convenience getter for easy access to form fields
    get f() { return this.statusForm.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.statusForm.invalid) {
            return;
        }

        this.updating = true;
        this.requestService.update(this.id, this.statusForm.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Request status updated successfully');
                    this.updating = false;
                    this.loadRequestDetails(); // Reload the updated request
                },
                (error: any) => {
                    this.alertService.error('Error updating request status: ' + error);
                    this.updating = false;
                }
            );
    }
}