export type ProcessType = 'CPU-Bound' | 'I/O-Bound' | 'Mixed';

export interface Process {
  pid: string;
  arrival: number;
  cpuBurst: number;
  ioBurst: number;
  type: ProcessType;
  color: string;
}

export type ProcessDraft = Omit<Process, 'color'>;

export interface SchedulerMetrics {
  name: string;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
  cpuUtilization: number;
  throughput: number;
}

export type SchedulerName = 'FCFS' | 'SJF' | 'RR' | 'CFS';

export interface GanttSegment {
  pid: string | null;
  start: number;
  end: number;
  color: string;
}

export interface SchedulerRun {
  metrics: SchedulerMetrics;
  segments: GanttSegment[];
}
