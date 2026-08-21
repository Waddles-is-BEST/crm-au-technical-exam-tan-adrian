import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <!-- Top Navigation Bar -->
      <header class="bg-indigo-600 shadow-sm border-b border-indigo-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Brand Logo & Name -->
            <div class="flex items-center space-x-3">
              <a routerLink="/customers" class="flex items-center space-x-2 text-white hover:text-indigo-100 transition-colors">
                <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg text-white border border-white/20">
                  CRM
                </div>
                <span class="font-bold text-xl tracking-tight text-white">Customer Manager</span>
              </a>
            </div>

            <!-- Navigation Links -->
            <nav class="flex items-center space-x-4">
              <a
                routerLink="/customers"
                class="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700/50 transition-colors"
              >
                Customers
              </a>
              <a
                routerLink="/customers/create"
                class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-indigo-700 bg-white rounded-lg hover:bg-indigo-50 shadow-sm transition-all"
              >
                + New Customer
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Container -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 py-4 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          CRM Customer Management &copy; {{ currentYear }} &bull; Built with Laravel, Angular & Tailwind CSS
        </div>
      </footer>
    </div>
  `,
})
export class App {
  readonly currentYear = new Date().getFullYear();
}
