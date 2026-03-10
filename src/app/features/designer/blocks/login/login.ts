import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login-block',
  standalone: true,
  imports: [FormsModule, Button, InputText, ToastModule, CardModule],
  providers: [MessageService],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginBlock {
  private readonly messageService = inject(MessageService);

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected onLogin(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Login',
      detail: `Email: ${this.email()} | Password: ${this.password()}`,
      life: 5000,
    });
  }
}
