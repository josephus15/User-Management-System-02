import { Account } from './account';
import { Department } from './department';

export class Employee {
    id?: number;
    employeeId!: string;  
    position!: string;    
    departmentId!: number;
    accountId!: number;   
    hireDate!: Date;      
    status: string = 'Active';
    created?: Date;
    account?: Account;
    department?: Department;
}

export class EmployeeCreate {
    accountId!: number;  
    employeeId!: string;  
    position!: string;    
    departmentId!: number; 
    hireDate!: Date;     
}

export class EmployeeUpdate {
    position?: string;
    departmentId?: number;
    status?: string;
}