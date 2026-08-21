import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-view.component.html',
})
export class CustomerViewComponent implements OnInit {
  customer: Customer | null = null;
  isLoading = false;
  errorMessage = '';
  isDeleting = false;
  showDeleteConfirm = false;

  constructor(
    private readonly customerService: CustomerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomer(id);
  }

  loadCustomer(id: number): void {
    this.isLoading = true;
    this.customerService
      .getById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.customer = response.data;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Customer not found.';
          this.changeDetector.detectChanges();
        },
      });
  }

  deleteCustomer(): void {
    if (!this.customer) return;
    this.isDeleting = true;

    this.customerService.delete(this.customer.id).subscribe({
      next: () => {
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.errorMessage = 'Failed to delete customer.';
        this.isDeleting = false;
        this.showDeleteConfirm = false;
      },
    });
  }
}
