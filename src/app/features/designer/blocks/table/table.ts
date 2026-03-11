import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Tooltip } from 'primeng/tooltip';

export interface Column {
  field: string;
  header: string;
  sortable: boolean;
  style: string;
  filterType?: string;
}

export interface ForestPlot {
  talhao: string;
  fazenda: string;
  especie: string;
  tipo: string;
  status: string;
  idade: number;
  dap: number;
  area: number;
  revisor: string | null;
}

const SPECIES = [
  'Eucalyptus urophylla',
  'Eucalyptus grandis',
  'Pinus elliottii',
  'Pinus taeda',
  'Eucalyptus saligna',
  'Teca (Tectona grandis)',
  'Pinus caribaea',
];

const TIPOS = ['Inventário', 'Medição', 'Colheita'];
const STATUSES = ['Em Progresso', 'Concluído', 'Pendente'];

const SEED_DATA: ForestPlot[] = [
  { talhao: 'T-001', fazenda: 'Fazenda Boa Vista', especie: 'Eucalyptus urophylla', tipo: 'Inventário', status: 'Em Progresso', idade: 4, dap: 12.3, area: 18, revisor: 'Carlos Lima' },
  { talhao: 'T-002', fazenda: 'Fazenda Boa Vista', especie: 'Eucalyptus grandis', tipo: 'Inventário', status: 'Concluído', idade: 6, dap: 18.7, area: 29, revisor: 'Carlos Lima' },
  { talhao: 'T-003', fazenda: 'Fazenda São João', especie: 'Pinus elliottii', tipo: 'Medição', status: 'Concluído', idade: 8, dap: 22.4, area: 10, revisor: 'Ana Costa' },
  { talhao: 'T-004', fazenda: 'Fazenda São João', especie: 'Pinus taeda', tipo: 'Medição', status: 'Em Progresso', idade: 5, dap: 15.8, area: 2, revisor: 'Ana Costa' },
  { talhao: 'T-005', fazenda: 'Fazenda Verde', especie: 'Eucalyptus urophylla', tipo: 'Colheita', status: 'Em Progresso', idade: 7, dap: 20.1, area: 20, revisor: 'Paulo Souza' },
  { talhao: 'T-006', fazenda: 'Fazenda Verde', especie: 'Eucalyptus saligna', tipo: 'Colheita', status: 'Concluído', idade: 6, dap: 17.5, area: 25, revisor: 'Paulo Souza' },
  { talhao: 'T-007', fazenda: 'Fazenda Horizonte', especie: 'Teca (Tectona grandis)', tipo: 'Inventário', status: 'Concluído', idade: 9, dap: 28.6, area: 7, revisor: 'Paulo Souza' },
  { talhao: 'T-008', fazenda: 'Fazenda Horizonte', especie: 'Eucalyptus urophylla', tipo: 'Medição', status: 'Concluído', idade: 3, dap: 10.2, area: 23, revisor: 'Paulo Souza' },
  { talhao: 'T-009', fazenda: 'Fazenda Cerrado', especie: 'Pinus caribaea', tipo: 'Inventário', status: 'Pendente', idade: 4, dap: 13.9, area: 30, revisor: 'Paulo Souza' },
  { talhao: 'T-010', fazenda: 'Fazenda Cerrado', especie: 'Eucalyptus grandis', tipo: 'Colheita', status: 'Concluído', idade: 7, dap: 21.3, area: 28, revisor: 'Paulo Souza' },
];

@Component({
  selector: 'app-table-block',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    Tag,
    MultiSelect,
    Select,
    ConfirmDialog,
    InputText,
    IconField,
    InputIcon,
    Dialog,
    InputNumber,
    Tooltip,
  ],
  providers: [ConfirmationService],
  templateUrl: './table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBlock implements OnInit {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  protected readonly dt = viewChild<Table>('dt');

  // ── Data ───────────────────────────────────────────────────────────────────
  protected readonly forestPlots = signal<ForestPlot[]>([...SEED_DATA]);

  // ── Table UI state ─────────────────────────────────────────────────────────
  protected readonly loading = signal(false);
  protected readonly tableSize = signal<'small' | undefined | 'large'>(undefined);
  protected readonly globalFilterValue = signal('');

  protected selectedPlots: ForestPlot[] = [];

  protected readonly sizeOptions = [
    { label: 'Pequeno', value: 'small' },
    { label: 'Normal', value: undefined },
    { label: 'Grande', value: 'large' },
  ];

  // ── Columns ────────────────────────────────────────────────────────────────
  protected readonly cols: Column[] = [
    { field: 'fazenda', header: 'Fazenda', sortable: true, style: 'min-width: 10rem', filterType: 'text' },
    { field: 'especie', header: 'Espécie', sortable: true, style: 'min-width: 12rem', filterType: 'text' },
    { field: 'tipo', header: 'Tipo', sortable: true, style: 'min-width: 8rem', filterType: 'text' },
    { field: 'status', header: 'Status', sortable: true, style: 'min-width: 9rem', filterType: 'text' },
    { field: 'idade', header: 'Idade (ano)', sortable: true, style: 'min-width: 8rem', filterType: 'numeric' },
    { field: 'dap', header: 'DAP (cm)', sortable: true, style: 'min-width: 8rem', filterType: 'numeric' },
    { field: 'area', header: 'Área (ha)', sortable: true, style: 'min-width: 8rem', filterType: 'numeric' },
    { field: 'revisor', header: 'Responsável', sortable: false, style: 'min-width: 10rem', filterType: 'text' },
  ];

  protected selectedColumns: Column[] = [...this.cols];

  protected readonly globalFilterFields = ['talhao', 'fazenda', 'especie', 'tipo', 'status', 'revisor'];

  // ── Dialog state ───────────────────────────────────────────────────────────
  protected readonly viewDialogVisible = signal(false);
  protected readonly editDialogVisible = signal(false);
  protected readonly createDialogVisible = signal(false);
  protected readonly selectedPlot = signal<ForestPlot | null>(null);

  protected editForm!: FormGroup;
  protected createForm!: FormGroup;

  // ── Species & options ──────────────────────────────────────────────────────
  protected readonly speciesOptions = SPECIES.map((s) => ({ label: s, value: s }));
  protected readonly tipoOptions = TIPOS.map((t) => ({ label: t, value: t }));
  protected readonly statusOptions = STATUSES.map((s) => ({ label: s, value: s }));

  // ── Validators ─────────────────────────────────────────────────────────────
  enumValidator(allowedValues: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return allowedValues.includes(control.value)
        ? null
        : { invalidEnum: { value: control.value, allowed: allowedValues } };
    };
  }

  ngOnInit(): void {
    const plotFormConfig = {
      talhao: ['', [Validators.required, Validators.pattern(/^T-\d{3}$/)]],
      fazenda: ['', Validators.required],
      especie: ['', [Validators.required, this.enumValidator(SPECIES)]],
      tipo: ['', [Validators.required, this.enumValidator(TIPOS)]],
      status: ['', [Validators.required, this.enumValidator(STATUSES)]],
      idade: [null as number | null, [Validators.required, Validators.min(0)]],
      dap: [null as number | null, [Validators.required, Validators.min(0)]],
      area: [null as number | null, [Validators.required, Validators.min(0)]],
      revisor: [null as string | null],
    };
    this.editForm = this.fb.group(plotFormConfig);
    this.createForm = this.fb.group(plotFormConfig);
  }

  // ── Table helpers ──────────────────────────────────────────────────────────
  protected getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    if (status === 'Concluído') return 'success';
    if (status === 'Em Progresso') return 'warn';
    return 'secondary';
  }

  protected getStatusIcon(status: string): string {
    if (status === 'Concluído') return 'pi pi-check-circle';
    if (status === 'Em Progresso') return 'pi pi-clock';
    return 'pi pi-circle';
  }

  protected sortSelectedColumns(): void {
    this.selectedColumns = this.cols.filter((col) =>
      this.selectedColumns.some((sc) => sc.field === col.field),
    );
  }

  protected onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalFilterValue.set(value);
    this.dt()?.filterGlobal(value, 'contains');
  }

  protected refresh(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }

  protected exportCsv(): void {
    this.dt()?.exportCSV();
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  protected openViewDialog(plot: ForestPlot): void {
    this.selectedPlot.set(plot);
    this.viewDialogVisible.set(true);
  }

  protected openEditDialog(plot: ForestPlot): void {
    this.selectedPlot.set(plot);
    this.editForm.patchValue(plot);
    this.editDialogVisible.set(true);
  }

  protected openCreateDialog(): void {
    this.createForm.reset();
    this.createDialogVisible.set(true);
  }

  protected saveEdit(): void {
    if (this.editForm.invalid) return;
    const updated = this.editForm.value as ForestPlot;
    this.forestPlots.update((list) =>
      list.map((p) => (p.talhao === updated.talhao ? { ...p, ...updated } : p)),
    );
    this.editDialogVisible.set(false);
  }

  protected saveCreate(): void {
    if (this.createForm.invalid) return;
    const newPlot = this.createForm.value as ForestPlot;
    this.forestPlots.update((list) => [...list, newPlot]);
    this.createDialogVisible.set(false);
  }

  protected confirmDelete(plot: ForestPlot): void {
    this.confirmationService.confirm({
      header: 'Deletar Talhão',
      message: `Tem certeza que deseja deletar o talhão "${plot.talhao}"?`,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', variant: 'outlined' },
      acceptButtonProps: { label: 'Deletar', severity: 'danger' },
      accept: () => {
        this.forestPlots.update((list) => list.filter((p) => p.talhao !== plot.talhao));
      },
    });
  }
}
