import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  customerId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  serverErrors: Record<string, string[]> = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      contact_number: ['', [Validators.maxLength(50)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.customerId = Number(id);
      this.loadCustomer(this.customerId);
    }
  }

  loadCustomer(id: number): void {
    this.isLoading = true;
    this.customerService.getById(id).subscribe({
      next: (response) => {
        const c: Customer = response.data;
        this.form.patchValue({
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          contact_number: c.contact_number ?? '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Customer not found.';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.serverErrors = {};

    const payload = {
      ...this.form.value,
      contact_number: this.form.value.contact_number || null,
    };

    const request$ = this.isEditMode
      ? this.customerService.update(this.customerId!, payload)
      : this.customerService.create(payload);

    request$.subscribe({
      next: (response) => {
        this.router.navigate(['/customers', response.data.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 422 && err.error?.errors) {
          this.serverErrors = err.error.errors;
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      },
    });
  }

  /** Helper to get validation error for a field */
  getError(field: string): string | null {
    const control = this.form.get(field);

    if (this.serverErrors[field]) {
      return this.serverErrors[field][0];
    }

    if (control?.invalid && control.touched) {
      if (control.errors?.['required']) return `${this.fieldLabel(field)} is required.`;
      if (control.errors?.['email']) return 'Please enter a valid email address.';
      if (control.errors?.['maxlength']) return `${this.fieldLabel(field)} is too long.`;
    }

    return null;
  }

  private fieldLabel(field: string): string {
    const labels: Record<string, string> = {
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      contact_number: 'Contact number',
    };
    return labels[field] ?? field;
  }
}
