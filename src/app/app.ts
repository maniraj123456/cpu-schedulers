import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { ExecutionTimelineComponent } from '../components/execution-timeline/execution-timeline';
import { ProcessFormComponent } from '../components/process-form/process-form';
import { ProcessQueueComponent } from '../components/process-queue/process-queue';
import { SchedulerMetricsComponent } from '../components/scheduler-metrics/scheduler-metrics';
import { Process, ProcessDraft, SchedulerMetrics, SchedulerRun } from '../models/scheduler.models';
import { simulateSchedulers } from '../utils/scheduler-simulator';

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
  readonly roundRobinQuantum = signal(4);
  readonly schedulerRuns = signal<SchedulerRun[]>([]);
  readonly nextPid = computed(() => `P${this.processes().length + 1}`);
  private simulationVersion = 0;

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
    this.invalidateSimulation();
  }

  removeProcess(pid: string): void {
    this.processes.update((processes) => processes.filter((process) => process.pid !== pid));
    this.invalidateSimulation();
  }

  setRoundRobinQuantum(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    this.roundRobinQuantum.set(input.valueAsNumber);
    this.invalidateSimulation();
  }

  runSimulation(): void {
    if (this.processes().length === 0) return;

    const version = ++this.simulationVersion;
    const processes = this.processes().map((process) => ({ ...process }));
    const quantum = this.roundRobinQuantum();
    this.isSimulating.set(true);
    setTimeout(() => {
      if (version !== this.simulationVersion) return;

      const runs = simulateSchedulers(processes, quantum);
      this.schedulerRuns.set(runs);
      this.metrics.set(runs.map((run) => run.metrics));
      this.isSimulating.set(false);
      this.simulationRun.set(true);
    }, 1200);
  }

  private invalidateSimulation(): void {
    this.simulationVersion += 1;
    this.isSimulating.set(false);
    this.simulationRun.set(false);
    this.schedulerRuns.set([]);
    this.metrics.set([
      { name: 'FCFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
      { name: 'SJF', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
      { name: 'RR', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
      { name: 'CFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    ]);
  }

  private getNextColor(): string {
    const color = this.colors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    return color;
  }

}
