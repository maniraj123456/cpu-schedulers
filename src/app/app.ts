import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Define the Process interface
interface Process {
  pid: string;
  arrival: number;
  cpuBurst: number;
  ioBurst: number;
  type: 'CPU-Bound' | 'I/O-Bound' | 'Mixed';
  color: string;
}

// Define the Metrics interface
interface SchedulerMetrics {
  name: string;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
  cpuUtilization: number;
  throughput: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private fb = inject(FormBuilder);
  
  // State Signals
  processes = signal<Process[]>([]);
  activeTab = signal<string>('CFS');
  isSimulating = signal<boolean>(false);
  simulationRun = signal<boolean>(false);
  
  // Form Setup
  processForm!: FormGroup;
  
  // Color palette for processes
  private colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
  private colorIndex = 0;

  // Placeholder metrics to display initially
  private defaultMetrics: SchedulerMetrics[] = [
    { name: 'FCFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'SJF', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'RR', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 },
    { name: 'CFS', turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 }
  ];
  
  metrics = signal<SchedulerMetrics[]>(this.defaultMetrics);

  ngOnInit() {
    this.processForm = this.fb.group({
      pid: ['P1', Validators.required],
      arrival: [0, [Validators.required, Validators.min(0)]],
      cpuBurst: [10, [Validators.required, Validators.min(1)]],
      ioBurst: [2, [Validators.required, Validators.min(0)]],
      type: ['CPU-Bound', Validators.required]
    });
    
    // Add some default processes to demonstrate UI
    this.addDefaultProcesses();
  }

  addDefaultProcesses() {
    const defaultData: Process[] = [
      { pid: 'P1', arrival: 0, cpuBurst: 24, ioBurst: 3, type: 'CPU-Bound', color: this.getNextColor() },
      { pid: 'P2', arrival: 2, cpuBurst: 3, ioBurst: 10, type: 'I/O-Bound', color: this.getNextColor() },
      { pid: 'P3', arrival: 4, cpuBurst: 12, ioBurst: 5, type: 'Mixed', color: this.getNextColor() }
    ];
    this.processes.set(defaultData);
    this.updateNextPid();
  }

  addProcess() {
    if (this.processForm.valid) {
      const newProcess: Process = {
        ...this.processForm.value,
        color: this.getNextColor()
      };
      
      this.processes.update(procs => [...procs, newProcess]);
      this.simulationRun.set(false); // Reset simulation state on new data
      this.updateNextPid();
    }
  }

  removeProcess(pid: string) {
    this.processes.update(procs => procs.filter(p => p.pid !== pid));
    this.simulationRun.set(false);
  }

  private getNextColor(): string {
    const color = this.colors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    return color;
  }

  private updateNextPid() {
    const count = this.processes().length + 1;
    this.processForm.patchValue({ pid: `P${count}` });
  }

  // Simulated backend call
  runSimulation() {
    if (this.processes().length === 0) return;
    
    this.isSimulating.set(true);
    
    // Fake delay to simulate backend computation
    setTimeout(() => {
      this.isSimulating.set(false);
      this.simulationRun.set(true);
      this.generateMockMetrics();
    }, 1200);
  }

  // Generate realistic-looking fake metrics for UI presentation purposes
  private generateMockMetrics() {
    const count = this.processes().length;
    // FCFS usually has highest waiting
    // SJF is optimal for average waiting
    // RR is good for response but worse for turnaround
    // CFS tries to balance fairness, good for mixed I/O
    
    this.metrics.set([
      { 
        name: 'FCFS', 
        turnaroundTime: 28 + (count * 4), 
        waitingTime: 18 + (count * 4), 
        responseTime: 18 + (count * 4), 
        cpuUtilization: 85, 
        throughput: 1.2 
      },
      { 
        name: 'SJF', 
        turnaroundTime: 22 + (count * 2), 
        waitingTime: 12 + (count * 2), 
        responseTime: 12 + (count * 2), 
        cpuUtilization: 92, 
        throughput: 1.8 
      },
      { 
        name: 'RR', 
        turnaroundTime: 30 + (count * 3), 
        waitingTime: 14 + (count * 3), 
        responseTime: 4 + count, 
        cpuUtilization: 88, 
        throughput: 1.5 
      },
      { 
        name: 'CFS', 
        turnaroundTime: 24 + (count * 2), 
        waitingTime: 13 + (count * 2), 
        responseTime: 6 + count, 
        cpuUtilization: 98, 
        throughput: 1.7 
      }
    ]);
  }

  // Computed signal to bind directly to UI
  displayMetrics = computed(() => this.metrics());
}
