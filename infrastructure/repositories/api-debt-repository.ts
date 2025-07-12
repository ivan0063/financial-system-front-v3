import type { Debt } from "../../domain/entities/debt"
import type { DebtRepository } from "../../domain/repositories/debt-repository"
import type { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { type Observable, map, catchError, throwError } from "rxjs"

interface ApiResponse {
  debts: Debt[]
}

@Injectable({
  providedIn: "root",
})
export class ApiDebtRepository implements DebtRepository {
  private apiUrl = "https://api.example.com/debts" // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  findAll(): Observable<Debt[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map((response) => {
        if (!response || !response.debts) {
          throw new Error("Invalid API response: Debts array is missing.")
        }
        return response.debts.map((debt) => ({
          id: debt.id,
          amount: debt.amount,
          description: debt.description,
          dueDate: new Date(debt.dueDate),
          status: debt.status,
        }))
      }),
      catchError((error) => {
        console.error("Error fetching debts:", error)
        return throwError(() => new Error("Failed to fetch debts."))
      }),
    )
  }

  findById(id: string): Observable<Debt | undefined> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (!response || !response.debts || response.debts.length === 0) {
          return undefined
        }
        const debt = response.debts[0] // Assuming the API returns a list even for a single debt
        return {
          id: debt.id,
          amount: debt.amount,
          description: debt.description,
          dueDate: new Date(debt.dueDate),
          status: debt.status,
        }
      }),
      catchError((error) => {
        console.error(`Error fetching debt with id ${id}:`, error)
        return throwError(() => new Error(`Failed to fetch debt with id ${id}.`))
      }),
    )
  }

  create(debt: Debt): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, debt).pipe(
      map((response) => {
        return {
          id: response.id,
          amount: response.amount,
          description: response.description,
          dueDate: new Date(response.dueDate),
          status: response.status,
        }
      }),
      catchError((error) => {
        console.error("Error creating debt:", error)
        return throwError(() => new Error("Failed to create debt."))
      }),
    )
  }

  update(debt: Debt): Observable<Debt> {
    return this.http.put<Debt>(`${this.apiUrl}/${debt.id}`, debt).pipe(
      map((response) => {
        return {
          id: response.id,
          amount: response.amount,
          description: response.description,
          dueDate: new Date(response.dueDate),
          status: response.status,
        }
      }),
      catchError((error) => {
        console.error(`Error updating debt with id ${debt.id}:`, error)
        return throwError(() => new Error(`Failed to update debt with id ${debt.id}.`))
      }),
    )
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error deleting debt with id ${id}:`, error)
        return throwError(() => new Error(`Failed to delete debt with id ${id}.`))
      }),
    )
  }
}
