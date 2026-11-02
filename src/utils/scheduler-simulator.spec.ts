import { Process } from '../models/scheduler.models';
import { simulateSchedulers } from './scheduler-simulator';

describe('simulateSchedulers', () => {
  const processes: Process[] = [
    { pid: 'P1', arrival: 0, cpuBurst: 5, ioBurst: 0, type: 'CPU-Bound', color: '#f00' },
    { pid: 'P2', arrival: 1, cpuBurst: 2, ioBurst: 0, type: 'I/O-Bound', color: '#00f' },
  ];

  it('calculates metrics and execution slices from process inputs', () => {
    const runs = simulateSchedulers(processes, 2);

    expect(runs.map((run) => run.metrics.name)).toEqual(['FCFS', 'SJF', 'RR', 'CFS']);
    expect(runs[0].metrics).toEqual({
      name: 'FCFS',
      turnaroundTime: 5.5,
      waitingTime: 2,
      responseTime: 2,
      cpuUtilization: 100,
      throughput: 0.29,
    });
    expect(runs[2].segments.map(({ pid, start, end }) => [pid, start, end])).toEqual([
      ['P1', 0, 2],
      ['P2', 2, 4],
      ['P1', 4, 7],
    ]);
  });

  it('changes Round Robin execution slices when the time quantum changes', () => {
    const rrSegments = simulateSchedulers(processes, 5)[2].segments;

    expect(rrSegments.map(({ pid, start, end }) => [pid, start, end])).toEqual([
      ['P1', 0, 5],
      ['P2', 5, 7],
    ]);
  });

  it('includes idle time and I/O completion time in utilization and turnaround', () => {
    const process: Process = {
      pid: 'P1',
      arrival: 2,
      cpuBurst: 4,
      ioBurst: 3,
      type: 'Mixed',
      color: '#f00',
    };
    const run = simulateSchedulers([process], 2)[0];

    expect(run.segments.map(({ pid, start, end }) => [pid, start, end])).toEqual([
      [null, 0, 2],
      ['P1', 2, 6],
    ]);
    expect(run.metrics).toEqual({
      name: 'FCFS',
      turnaroundTime: 7,
      waitingTime: 0,
      responseTime: 0,
      cpuUtilization: 57.1,
      throughput: 0.14,
    });
  });
});
