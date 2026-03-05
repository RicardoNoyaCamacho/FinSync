import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Transaction } from '../../../../core/models/transactions.model';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="relative h-[300px] w-full flex justify-center items-center">
      @if (hasData()) {
        <canvas baseChart [data]="chartData()" [options]="chartOptions" [type]="chartType"></canvas>
      } @else {
        <div class="text-center text-slate-500">
          <p>No hay gastos en este periodo 📉</p>
          <p class="text-xs mt-1">Tu corte fue el día {{ cutoffDay() }}</p>
        </div>
      }
    </div>
  `
})
export class ExpenseChartComponent {
  transactions = input.required<Transaction[]>();
  cutoffDay = input.required<number>(); // <--- NUEVO INPUT: DÍA DE CORTE

  chartType: ChartType = 'doughnut';
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8' } }
    },
    elements: { arc: { borderWidth: 0 } }
  };

  chartData = computed<ChartData<'doughnut'>>(() => {
    const txs = this.transactions();
    const cutDay = this.cutoffDay();
    const now = new Date();
    const currentDay = now.getDate();

    // LÓGICA MAESTRA DEL CORTE ✂️
    // Si hoy es 20 y el corte es el 15 -> El periodo empezó el 15 de este mes.
    // Si hoy es 5 y el corte es el 15 -> El periodo empezó el 15 del MES PASADO.
    let startDate: Date;

    if (currentDay >= cutDay) {
      // Estamos después del corte: Inicio = Día de corte de ESTE mes
      startDate = new Date(now.getFullYear(), now.getMonth(), cutDay);
    } else {
      // Estamos antes del corte: Inicio = Día de corte del MES ANTERIOR
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, cutDay);
    }

    // Reseteamos las horas para comparar solo fechas
    startDate.setHours(0, 0, 0, 0);

    // 1. Filtramos: Solo gastos QUE SEAN POSTERIORES A LA FECHA DE INICIO
    const expenses = txs.filter(t => {
      const tDate = new Date(t.transactionDate);
      return t.type === 'EXPENSE' && tDate >= startDate;
    });

    // 2. Agrupamos por Categoría (Igual que antes)
    const categoryMap = new Map<string, number>();
    expenses.forEach(tx => {
      const cat = tx.category || 'Otros';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
    });

    return {
      labels: Array.from(categoryMap.keys()),
      datasets: [{
        data: Array.from(categoryMap.values()),
        backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'],
        hoverOffset: 4
      }]
    };
  });

  hasData = computed(() => this.chartData().datasets[0].data.length > 0);
}
