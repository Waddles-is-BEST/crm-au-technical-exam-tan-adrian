import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnInit {
  readonly emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
    private readonly route: ActivatedRoute,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(45)]],
      last_name: ['', [Validators.required, Validators.maxLength(45)]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern), Validators.maxLength(100)]],
      contact_number: ['', [Validators.pattern(/^[0-9]*$/), Validators.maxLength(15)]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.customerId = Number(id);
      this.loadCustomer(this.customerId);
    }
  }

  /** Strips all non-digit characters in real time */
  onNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    input.value = sanitized;
    this.form.get('contact_number')?.setValue(sanitized, { emitEvent: true });
  }

  loadCustomer(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

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
          const c: Customer = response.data;
          this.form.patchValue({
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            contact_number: c.contact_number ? c.contact_number.replace(/\D/g, '') : '',
          });
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Customer not found.';
          this.changeDetector.detectChanges();
        },
      });
  }

  /** Normalizes email to lowercase in real time */
  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lower = input.value.toLowerCase().trim();
    if (input.value !== lower) {
      input.value = lower;
      this.form.get('email')?.setValue(lower, { emitEvent: true });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.changeDetector.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.serverErrors = {};
    this.changeDetector.detectChanges();

    const rawNum = this.form.value.contact_number?.toString().replace(/\D/g, '') || null;

    const payload = {
      first_name: this.form.value.first_name,
      last_name: this.form.value.last_name,
      email: this.form.value.email?.toLowerCase().trim(),
      contact_number: rawNum,
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
        this.changeDetector.detectChanges();
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
      if (control.errors?.['pattern']) {
        if (field === 'email') return 'Please enter a valid email address with @ and a domain (e.g. name@example.com).';
        if (field === 'contact_number') return 'Only numbers are allowed.';
      }
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



