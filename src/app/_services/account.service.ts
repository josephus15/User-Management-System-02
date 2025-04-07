import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Account } from '../_models/account'; // Import Account model

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(private http: HttpClient) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account | null {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<Account>(`${environment.apiUrl}/accounts/authenticate`, { email, password })
            .pipe(map(account => {
                localStorage.setItem('account', JSON.stringify(account));
                this.accountSubject.next(account);
                return account;
            }));
    }

    logout() {
        localStorage.removeItem('account');
        this.accountSubject.next(null);
    }

    register(account: Account) {
        return this.http.post(`${environment.apiUrl}/accounts/register`, account);
    }

    refreshToken() {
        return this.http.post<Account>(`${environment.apiUrl}/accounts/refresh-token`, {}, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    getAll() {
        return this.http.get<Account[]>(`${environment.apiUrl}/accounts`);
    }

    getById(id: string) {
        return this.http.get<Account>(`${environment.apiUrl}/accounts/${id}`);
    }

    create(params: any) {
        return this.http.post(`${environment.apiUrl}/accounts`, params);
    }

    forgotPassword(email: string) {
        return this.http.post(`${environment.apiUrl}/accounts/forgot-password`, { email });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${environment.apiUrl}/accounts/reset-password`, { token, password, confirmPassword });
    }

    verifyEmail(token: string) {
        return this.http.post(`${environment.apiUrl}/accounts/verify-email`, { token });
    }

    update(id: string, params: any) {
        return this.http.put(`${environment.apiUrl}/accounts/${id}`, params)
            .pipe(map((account: Account) => {
                if (account.id === this.accountValue?.id) {
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/accounts/${id}`)
            .pipe(finalize(() => {
                if (id === this.accountValue?.id) {
                    this.logout();
                }
            }));
    }

    private refreshTokenTimeout?: any;

    private startRefreshTokenTimer() {
        const jwtToken = JSON.parse(atob(this.accountValue!.jwtToken!.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}

// Update src/app/_services/index.ts to include the AccountService
export * from './alert.service';
export * from './account.service';