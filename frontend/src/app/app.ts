import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="min-h-screen max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 text-slate-800">
      <router-outlet />
    </main>
  `,
})
export class App {}

