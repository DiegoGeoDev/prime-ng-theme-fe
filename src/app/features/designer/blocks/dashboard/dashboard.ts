import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Drawer } from 'primeng/drawer';
import { ChartModule } from 'primeng/chart';

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

@Component({
  selector: 'app-dashboard-block',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    TableModule,
    Button,
    Tag,
    Tabs,
    TabList,
    Tab,
    AvatarModule,
    Card,
    Drawer,
    ChartModule,
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBlock implements OnInit {
  private readonly document = inject(DOCUMENT);

  protected sidebarVisible = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly chartData = signal<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly chartOptions = signal<any>(null);

  ngOnInit(): void {
    this.initChart();
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
      revisor: null,
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
      revisor: null,
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
      revisor: null,
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
      revisor: null,
    },
  ]);

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
}
