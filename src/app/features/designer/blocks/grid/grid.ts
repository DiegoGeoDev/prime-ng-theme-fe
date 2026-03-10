import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Button } from 'primeng/button';
import { DesignPreview } from '../preview/preview';
import { LoginBlock } from '../login/login';

export interface BlockOption {
  id: string;
  label: string;
  icon: string;
  component: unknown;
}

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [NgComponentOutlet, Button],
  templateUrl: './grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Grid {
  protected readonly blocks = signal<BlockOption[]>([
    { id: 'preview', label: 'Preview', icon: 'pi pi-eye', component: DesignPreview },
    { id: 'login', label: 'Login', icon: 'pi pi-sign-in', component: LoginBlock },
  ]);

  protected readonly selectedBlockId = signal<string>('preview');

  protected get selectedComponent(): unknown {
    return this.blocks().find((b) => b.id === this.selectedBlockId())?.component ?? null;
  }

  protected selectBlock(id: string): void {
    this.selectedBlockId.set(id);
  }
}
