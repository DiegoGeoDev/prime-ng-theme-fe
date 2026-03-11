import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT, DecimalPipe } from '@angular/common';
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

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Drawer } from 'primeng/drawer';
import { ChartModule } from 'primeng/chart';
import { MultiSelect } from 'primeng/multiselect';
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
}

export interface MedicaoItem {
  id: string;
  talhao: string;
  especie: string;
  tipo: string;
  status: string;
  tempo: string;
  icon: string;
  iconColor: string;
}

export interface MedicaoGroup {
  fazenda: string;
  items: MedicaoItem[];
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

interface KpiCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
}

interface NavItem {
  label: string;
  icon: string;
  active: boolean;
}

interface RecentDocument {
  name: string;
  ext: string;
  icon: string;
  size: string;
}

@Component({
  selector: 'app-dashboard-block',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    Tag,
    TabsModule,
    AvatarModule,
    Card,
    Drawer,
    ChartModule,
    MultiSelect,
    ConfirmDialog,
    InputText,
    IconField,
    InputIcon,
    Dialog,
    InputNumber,
    Tooltip,
  ],
  providers: [ConfirmationService],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBlock implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  protected sidebarVisible = false;

  protected readonly viewDialogVisible = signal(false);
  protected readonly editDialogVisible = signal(false);
  protected readonly createDialogVisible = signal(false);
  protected readonly selectedPlot = signal<ForestPlot | null>(null);
  protected editForm!: FormGroup;
  protected createForm!: FormGroup;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly chartData = signal<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly chartOptions = signal<any>(null);

  protected readonly recentDocuments = signal<RecentDocument[]>([
    { name: 'cadastro_florestal.docx', ext: 'docx', icon: 'word.svg', size: '214 KB' },
    { name: 'inventario_especies.xlsx', ext: 'xlsx', icon: 'excel.svg', size: '87 KB' },
    { name: 'mapa_cobertura.xlsx', ext: 'xlsx', icon: 'excel.svg', size: '341 KB' },
    { name: 'projeto_reflorestamento.psd', ext: 'psd', icon: 'ps.svg', size: '1,2 MB' },
    { name: 'script_analise_dap.js', ext: 'js', icon: 'code.svg', size: '18 KB' },
    { name: 'analise_vegetacao.ai', ext: 'ai', icon: 'ai.svg', size: '526 KB' },
    { name: 'plano_manejo_florestal.docx', ext: 'docx', icon: 'word.svg', size: '158 KB' },
    { name: 'registro_fauna.one', ext: 'one', icon: 'one.svg', size: '73 KB' },
    { name: 'monitoramento_flora.css', ext: 'css', icon: 'code.svg', size: '9 KB' },
    { name: 'laudo_tecnico_talhao.docx', ext: 'docx', icon: 'word.svg', size: '302 KB' },
  ]);

  enumValidator(allowedValues: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return allowedValues.includes(control.value)
        ? null
        : { invalidEnum: { value: control.value, allowed: allowedValues } };
    };
  }

  ngOnInit(): void {
    this.initChart();
    const plotFormConfig = {
      talhao: ['', [Validators.required, Validators.pattern(/^T-\d{3}$/)]],
      fazenda: ['', Validators.required],
      especie: [
        '',
        [
          Validators.required,
          this.enumValidator([
            'Eucalyptus urophylla',
            'Eucalyptus grandis',
            'Pinus elliottii',
            'Pinus taeda',
            'Eucalyptus saligna',
            'Teca (Tectona grandis)',
            'Pinus caribaea',
          ]),
        ],
      ],
      tipo: ['', Validators.required],
      status: ['', Validators.required],
      idade: [null as number | null, [Validators.required, Validators.min(0)]],
      dap: [null as number | null, [Validators.required, Validators.min(0)]],
      area: [null as number | null, [Validators.required, Validators.min(0)]],
      revisor: [null as string | null],
    };
    this.editForm = this.fb.group(plotFormConfig);
    this.createForm = this.fb.group(plotFormConfig);
  }

  private initChart(): void {
    const style = getComputedStyle(this.document.documentElement);
    const primary = style.getPropertyValue('--p-primary-color').trim() || '#10b981';
    const mutedText = style.getPropertyValue('--p-text-muted-color').trim() || '#6b7280';
    const borderColor = style.getPropertyValue('--p-content-border-color').trim() || '#e5e7eb';

    this.chartData.set({
      labels: [
        'Abr 1',
        'Abr 13',
        'Abr 26',
        'Mai 8',
        'Mai 21',
        'Jun 3',
        'Jun 15',
        'Jun 21',
        'Jun 29',
      ],
      datasets: [
        {
          label: 'Eucalyptus',
          data: [32, 48, 41, 64, 52, 80, 46, 72, 60],
          fill: true,
          tension: 0.4,
          borderColor: primary,
          backgroundColor: this.hexToRgba(primary, 0.12),
          pointBackgroundColor: primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
        {
          label: 'Pinus',
          data: [18, 28, 24, 40, 34, 55, 30, 48, 38],
          fill: true,
          tension: 0.4,
          borderColor: primary,
          borderDash: [5, 3],
          backgroundColor: this.hexToRgba(primary, 0.05),
          pointBackgroundColor: primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 1.5,
          borderOpacity: 0.5,
        },
      ],
    });

    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { dataset: { label: string }; parsed: { y: number } }) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y} m³/ha/ano`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: mutedText,
            font: { size: 9 },
            maxRotation: 0,
          },
        },
        y: {
          grid: {
            color: borderColor,
            lineWidth: 0.8,
          },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: mutedText,
            font: { size: 9 },
            stepSize: 20,
          },
          beginAtZero: true,
          max: 100,
        },
      },
    });
  }

  private hexToRgba(color: string, alpha: number): string {
    // handles both hex (#rrggbb) and css var resolved values
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // fallback for non-hex (e.g. oklch or rgb values)
    return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
  }

  protected readonly kpiCards = signal<KpiCard[]>([
    {
      label: 'Área Total',
      value: '12.450 ha',
      change: '+8,3%',
      trend: 'up',
      description: 'Crescimento este trimestre',
    },
    {
      label: 'Talhões Ativos',
      value: '342',
      change: '-5,2%',
      trend: 'down',
      description: 'Redução no período atual',
    },
    {
      label: 'DAP Médio',
      value: '18,4 cm',
      change: '+12,5%',
      trend: 'up',
      description: 'Alta retenção de crescimento',
    },
    {
      label: 'IMA Médio',
      value: '45,8 m³/ha/ano',
      change: '+4,5%',
      trend: 'up',
      description: 'Crescimento constante',
    },
  ]);

  protected readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'pi pi-home', active: true },
    { label: 'Ciclo de Vida', icon: 'pi pi-refresh', active: false },
    { label: 'Analítica', icon: 'pi pi-chart-bar', active: false },
    { label: 'Projetos', icon: 'pi pi-folder', active: false },
    { label: 'Equipe', icon: 'pi pi-users', active: false },
  ]);

  protected readonly florestNavItems = signal<NavItem[]>([
    { label: 'Fazendas', icon: 'pi pi-map-marker', active: false },
    { label: 'Talhões', icon: 'pi pi-th-large', active: true },
    { label: 'Relatórios', icon: 'pi pi-file-pdf', active: false },
    { label: 'Assistente IA', icon: 'pi pi-bolt', active: false },
    { label: 'Mais', icon: 'pi pi-ellipsis-h', active: false },
  ]);

  protected readonly forestPlots = signal<ForestPlot[]>([
    {
      talhao: 'T-001',
      fazenda: 'Fazenda Boa Vista',
      especie: 'Eucalyptus urophylla',
      tipo: 'Inventário',
      status: 'Em Progresso',
      idade: 4,
      dap: 12.3,
      area: 18,
      revisor: 'Carlos Lima',
    },
    {
      talhao: 'T-002',
      fazenda: 'Fazenda Boa Vista',
      especie: 'Eucalyptus grandis',
      tipo: 'Inventário',
      status: 'Concluído',
      idade: 6,
      dap: 18.7,
      area: 29,
      revisor: 'Carlos Lima',
    },
    {
      talhao: 'T-003',
      fazenda: 'Fazenda São João',
      especie: 'Pinus elliottii',
      tipo: 'Medição',
      status: 'Concluído',
      idade: 8,
      dap: 22.4,
      area: 10,
      revisor: 'Ana Costa',
    },
    {
      talhao: 'T-004',
      fazenda: 'Fazenda São João',
      especie: 'Pinus taeda',
      tipo: 'Medição',
      status: 'Em Progresso',
      idade: 5,
      dap: 15.8,
      area: 2,
      revisor: 'Ana Costa',
    },
    {
      talhao: 'T-005',
      fazenda: 'Fazenda Verde',
      especie: 'Eucalyptus urophylla',
      tipo: 'Colheita',
      status: 'Em Progresso',
      idade: 7,
      dap: 20.1,
      area: 20,
      revisor: 'Paulo Souza',
    },
    {
      talhao: 'T-006',
      fazenda: 'Fazenda Verde',
      especie: 'Eucalyptus saligna',
      tipo: 'Colheita',
      status: 'Concluído',
      idade: 6,
      dap: 17.5,
      area: 25,
      revisor: 'Paulo Souza',
    },
    {
      talhao: 'T-007',
      fazenda: 'Fazenda Horizonte',
      especie: 'Teca (Tectona grandis)',
      tipo: 'Inventário',
      status: 'Concluído',
      idade: 9,
      dap: 28.6,
      area: 7,
      revisor: 'Paulo Souza',
    },
    {
      talhao: 'T-008',
      fazenda: 'Fazenda Horizonte',
      especie: 'Eucalyptus urophylla',
      tipo: 'Medição',
      status: 'Concluído',
      idade: 3,
      dap: 10.2,
      area: 23,
      revisor: 'Paulo Souza',
    },
    {
      talhao: 'T-009',
      fazenda: 'Fazenda Cerrado',
      especie: 'Pinus caribaea',
      tipo: 'Inventário',
      status: 'Pendente',
      idade: 4,
      dap: 13.9,
      area: 30,
      revisor: 'Paulo Souza',
    },
    {
      talhao: 'T-010',
      fazenda: 'Fazenda Cerrado',
      especie: 'Eucalyptus grandis',
      tipo: 'Colheita',
      status: 'Concluído',
      idade: 7,
      dap: 21.3,
      area: 28,
      revisor: 'Paulo Souza',
    },
  ]);

  protected readonly cols: Column[] = [
    { field: 'talhao', header: 'Talhão', sortable: true, style: 'min-width: 7rem' },
    { field: 'fazenda', header: 'Fazenda', sortable: true, style: 'min-width: 9rem' },
    { field: 'especie', header: 'Espécie', sortable: false, style: 'min-width: 10rem' },
    { field: 'tipo', header: 'Tipo', sortable: true, style: 'min-width: 7rem' },
    { field: 'status', header: 'Status', sortable: true, style: 'min-width: 9rem' },
    { field: 'idade', header: 'Idade (ano)', sortable: true, style: 'min-width: 8rem' },
    { field: 'dap', header: 'DAP (cm)', sortable: true, style: 'min-width: 8rem' },
    { field: 'area', header: 'Área (ha)', sortable: true, style: 'min-width: 8rem' },
    { field: 'revisor', header: 'Responsável', sortable: false, style: 'min-width: 9rem' },
  ];

  protected selectedColumns: Column[] = [...this.cols];

  protected sortSelectedColumns(): void {
    this.selectedColumns = this.cols.filter((col) =>
      this.selectedColumns.some((sc) => sc.field === col.field),
    );
  }

  protected selectedPlots: ForestPlot[] = [];

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

  protected readonly medicaoGroups = signal<MedicaoGroup[]>([
    {
      fazenda: 'Fazenda Boa Vista',
      items: [
        {
          id: 'T-001',
          talhao: 'T-001',
          especie: 'Eucalyptus urophylla',
          tipo: 'Inventário',
          status: 'Em Progresso',
          tempo: '30 min atrás',
          icon: 'pi pi-list-check',
          iconColor: '#10b981',
        },
        {
          id: 'T-002',
          talhao: 'T-002',
          especie: 'Eucalyptus grandis',
          tipo: 'Inventário',
          status: 'Concluído',
          tempo: '2 horas atrás',
          icon: 'pi pi-list-check',
          iconColor: '#10b981',
        },
      ],
    },
    {
      fazenda: 'Fazenda São João',
      items: [
        {
          id: 'T-003',
          talhao: 'T-003',
          especie: 'Pinus elliottii',
          tipo: 'Medição',
          status: 'Concluído',
          tempo: '1 hora atrás',
          icon: 'pi pi-chart-bar',
          iconColor: '#3b82f6',
        },
        {
          id: 'T-004',
          talhao: 'T-004',
          especie: 'Pinus taeda',
          tipo: 'Medição',
          status: 'Em Progresso',
          tempo: '3 horas atrás',
          icon: 'pi pi-chart-bar',
          iconColor: '#3b82f6',
        },
      ],
    },
    {
      fazenda: 'Fazenda Verde',
      items: [
        {
          id: 'T-005',
          talhao: 'T-005',
          especie: 'Eucalyptus urophylla',
          tipo: 'Colheita',
          status: 'Em Progresso',
          tempo: '45 min atrás',
          icon: 'pi pi-box',
          iconColor: '#f59e0b',
        },
        {
          id: 'T-006',
          talhao: 'T-006',
          especie: 'Eucalyptus saligna',
          tipo: 'Colheita',
          status: 'Concluído',
          tempo: '1 dia atrás',
          icon: 'pi pi-box',
          iconColor: '#f59e0b',
        },
      ],
    },
  ]);

  protected medicaoSearch = '';

  protected getMedicaoStatusClass(status: string): string {
    if (status === 'Concluído') return 'text-green-600 dark:text-green-400';
    if (status === 'Em Progresso') return 'text-amber-500 dark:text-amber-400';
    return 'text-muted-color';
  }

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
    console.log('Atualizar talhão:', this.editForm.value);
    this.editDialogVisible.set(false);
  }

  protected saveCreate(): void {
    if (this.createForm.invalid) return;
    console.log('Criar talhão:', this.createForm.value);
    this.createDialogVisible.set(false);
  }

  protected confirmDelete(plot: ForestPlot): void {
    this.confirmationService.confirm({
      header: 'Deletar Talhão',
      message: `Tem certeza que deseja deletar o talhão "${plot.talhao}"?`,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', variant: 'outlined' },
      acceptButtonProps: { label: 'Deletar', severity: 'danger' },
      accept: () => {
        console.log('Deletar talhão:', plot);
      },
      reject: () => {
        console.log('Deleção cancelada');
      },
    });
  }

  protected confirmLogout(): void {
    this.confirmationService.confirm({
      header: 'Sair da aplicação',
      message: 'Tem certeza que deseja sair?',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', variant: 'outlined' },
      acceptButtonProps: { label: 'Sair', severity: 'danger' },
      accept: () => {
        console.log('Usuário confirmou logout');
      },
      reject: () => {
        console.log('Usuário cancelou logout');
      },
    });
  }
}
