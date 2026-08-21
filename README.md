# CRM Technical Exam - Customer Management System

This is a simple CRM customer management application built with Laravel, Angular, MySQL, and Elasticsearch using Docker Compose.

## Services
The application runs on 4 Docker containers:
- **api** - Laravel backend running on PHP-FPM
- **controller** - Nginx web server / reverse proxy that serves the Angular frontend and routes `/api/*` requests to the Laravel backend
- **database** - MySQL 8 database
- **searcher** - Elasticsearch 8 container used for searching customer records

## Requirements
- Docker Desktop / Docker Compose

## How to Run

1. Clone this repository and go to the project folder.

2. Create the environment file:
   ```bash
   cp .env.example .env
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up --build -d
   ```

4. Run the database migrations and seed sample customer data:
   ```bash
   docker-compose exec api php artisan migrate --seed
   ```

5. Initialize the Elasticsearch index and sync the database records:
   ```bash
   docker-compose exec api php artisan elasticsearch:setup
   ```

6. Open your browser and go to:
   http://localhost

## Features
- Create, view, edit, and delete customers
- Live search by name and email powered by Elasticsearch
- Automatic synchronization to Elasticsearch on create, update, and delete (built using Laravel HTTP client and Model Observers, without Laravel Scout)
- Form validation on both frontend and backend
- Customer email must be unique; first and last name are required

## API Endpoints
- `GET /api/customers` - List customers (supports `?search=` and pagination)
- `POST /api/customers` - Create a customer
- `GET /api/customers/{id}` - View customer details
- `PUT /api/customers/{id}` - Update a customer
- `DELETE /api/customers/{id}` - Delete a customer

## Running Tests
To run the automated tests:
```bash
docker-compose exec api php artisan test
```

## Stopping the App
```bash
docker-compose down
```

