import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, AlertService } from '@app/_services';
import { Workflow } from '@app/_models';

@Component({ templateUrl: 'details.component.html' })
export class DetailsComponent implements OnInit {
    id!: number;
    workflow!: Workflow;
    statusForm!: FormGroup;
    loading = true;
    updating = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.statusForm = this.formBuilder.group({
            status: ['', Validators.required],
            description: ['']
        });
        
        this.loadWorkflowDetails();
    }

    private loadWorkflowDetails() {
        this.workflowService.getById(this.id)
            .pipe(first())
            .subscribe(
                (workflow: Workflow) => {
                    this.workflow = workflow;
                    this.statusForm.patchValue({
                        status: workflow.status,
                        description: workflow.description
                    });
                    this.loading = false;
                },
                (error: any) => {
                    this.alertService.error('Error loading workflow details: ' + error);
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
        this.workflowService.update(this.id, this.statusForm.value)
            .pipe(first())
            .subscribe(
                () => {
                    this.alertService.success('Workflow status updated successfully');
                    this.updating = false;
                    this.loadWorkflowDetails(); // Reload the updated workflow
                },
                (error: any) => {
                    this.alertService.error('Error updating workflow status: ' + error);
                    this.updating = false;
                }
            );
    }
}