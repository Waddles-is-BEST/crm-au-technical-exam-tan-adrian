import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Customer,
  CustomerPayload,
  PaginatedResponse,
} from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = '/api/customers';

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve a paginated list of customers.
   * Optionally pass a search query to filter by name or email via Elasticsearch.
   */
  getAll(
    search = '',
    page = 1,
    perPage = 15
  ): Observable<PaginatedResponse<Customer>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PaginatedResponse<Customer>>(this.apiUrl, { params });
  }

  /**
   * Retrieve a single customer by ID.
   */
  getById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new customer.
   */
  create(payload: CustomerPayload): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.apiUrl, payload);
  }

  /**
   * Update an existing customer.
   */
  update(
    id: number,
    payload: CustomerPayload
  ): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  /**
   * Delete a customer by ID.
   */
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
