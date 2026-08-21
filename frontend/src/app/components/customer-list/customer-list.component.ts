import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { Customer, PaginatedResponse } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  meta = { current_page: 1, last_page: 1, per_page: 15, total: 0 };
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  deletingId: number | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private readonly customerService: CustomerService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();

    // Debounce search input — wait 350ms after user stops typing
    this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query) => {
        this.meta.current_page = 1;
        this.loadCustomers(query);
      });
  }

  loadCustomers(search = this.searchQuery, page = this.meta.current_page): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService
      .getAll(search, page, this.meta.per_page)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe({
        next: (response: PaginatedResponse<Customer>) => {
          this.customers = response.data;
          this.meta = response.meta;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Failed to load customers. Please try again.';
          this.changeDetector.detectChanges();
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.meta.last_page) return;
    this.meta.current_page = page;
    this.loadCustomers();
  }

  confirmDelete(id: number): void {
    this.deletingId = id;
  }

  cancelDelete(): void {
    this.deletingId = null;
  }

  deleteCustomer(id: number): void {
    this.customerService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Customer deleted successfully.';
        this.deletingId = null;
        this.loadCustomers();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete customer. Please try again.';
        this.deletingId = null;
      },
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.meta.last_page }, (_, i) => i + 1);
  }
}
