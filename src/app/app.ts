import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { ExecutionTimelineComponent } from '../components/execution-timeline/execution-timeline';
import { ProcessFormComponent } from '../components/process-form/process-form';
import { ProcessQueueComponent } from '../components/process-queue/process-queue';
import { SchedulerMetricsComponent } from '../components/scheduler-metrics/scheduler-metrics';
import { Process, ProcessDraft, SchedulerMetrics } from '../models/scheduler.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ExecutionTimelineComponent,
    ProcessFormComponent,
    ProcessQueueComponent,
    SchedulerMetricsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly processes = signal<Process[]>([]);
  readonly isSimulating = signal(false);
  readonly simulationRun = signal(false);
  readonly nextPid = computed(() => `P${this.processes().length + 1}`);

  private readonly colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
  private colorIndex = 0;

  readonly metrics = signal<SchedulerMetrics[]>([
    { name: 'FCFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'SJF', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'RR', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'CFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
  ]);

  ngOnInit(): void {
    this.processes.set([
      { pid: 'P1', arrival: 0, cpuBurst: 24, ioBurst: 3, type: 'CPU-Bound', color: this.getNextColor() },
      { pid: 'P2', arrival: 2, cpuBurst: 3, ioBurst: 10, type: 'I/O-Bound', color: this.getNextColor() },
      { pid: 'P3', arrival: 4, cpuBurst: 12, ioBurst: 5, type: 'Mixed', color: this.getNextColor() },
    ]);
  }

  addProcess(draft: ProcessDraft): void {
    this.processes.update((processes) => [...processes, { ...draft, color: this.getNextColor() }]);
    this.simulationRun.set(false);
  }

  removeProcess(pid: string): void {
    this.processes.update((processes) => processes.filter((process) => process.pid !== pid));
    this.simulationRun.set(false);
  }

  runSimulation(): void {
    if (this.processes().length === 0) return;

    this.isSimulating.set(true);
    setTimeout(() => {
      this.isSimulating.set(false);
      this.simulationRun.set(true);
      this.generateMockMetrics();
    }, 1200);
  }

  private getNextColor(): string {
    const color = this.colors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    return color;
  }

  private generateMockMetrics(): void {
    const count = this.processes().length;
    this.metrics.set([
      { name: 'FCFS', turnaroundTime: 28 + count * 4, waitingTime: 18 + count * 4, responseTime: 18 + count * 4, cpuUtilization: 85, throughput: 1.2 },
      { name: 'SJF', turnaroundTime: 22 + count * 2, waitingTime: 12 + count * 2, responseTime: 12 + count * 2, cpuUtilization: 92, throughput: 1.8 },
      { name: 'RR', turnaroundTime: 30 + count * 3, waitingTime: 14 + count * 3, responseTime: 4 + count, cpuUtilization: 88, throughput: 1.5 },
      { name: 'CFS', turnaroundTime: 24 + count * 2, waitingTime: 13 + count * 2, responseTime: 6 + count, cpuUtilization: 98, throughput: 1.7 },
    ]);
  }
}
