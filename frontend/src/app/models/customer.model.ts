export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
