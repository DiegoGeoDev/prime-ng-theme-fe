import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Drawer } from 'primeng/drawer';

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
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBlock {
  protected sidebarVisible = false;

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
