import {
  GanttSegment,
  Process,
  SchedulerMetrics,
  SchedulerName,
  SchedulerRun,
} from '../models/scheduler.models';

interface ProcessState {
  process: Process;
  order: number;
  remaining: number;
  firstStart: number | null;
  completion: number | null;
  virtualRuntime: number;
}

const schedulerNames: SchedulerName[] = ['FCFS', 'SJF', 'RR', 'CFS'];

export function simulateSchedulers(processes: Process[], quantum: number): SchedulerRun[] {
  return schedulerNames.map((name) => {
    const states = processes.map((process, order) => ({
      process,
      order,
      remaining: process.cpuBurst,
      firstStart: null,
      completion: null,
      virtualRuntime: 0,
    }));
    const segments = schedule(name, states, quantum);

    return {
      metrics: calculateMetrics(name, states, segments),
      segments,
    };
  });
}

function schedule(name: SchedulerName, states: ProcessState[], quantum: number): GanttSegment[] {
  if (name === 'FCFS' || name === 'SJF') {
    return scheduleNonPreemptive(name, states);
  }
  if (name === 'RR') {
    return scheduleRoundRobin(states, quantum);
  }
  return scheduleCfs(states);
}

function scheduleNonPreemptive(name: 'FCFS' | 'SJF', states: ProcessState[]): GanttSegment[] {
  const pending = [...states].sort((a, b) => a.process.arrival - b.process.arrival || a.order - b.order);
  const segments: GanttSegment[] = [];
  let time = 0;

  while (pending.length > 0) {
    if (pending[0].process.arrival > time) {
      const nextArrival = pending[0].process.arrival;
      addSegment(segments, null, time, nextArrival, '#334155');
      time = nextArrival;
    }

    const ready = pending
      .map((state, index) => ({ state, index }))
      .filter(({ state }) => state.process.arrival <= time);
    const selected = name === 'SJF'
      ? ready.reduce((best, candidate) =>
        candidate.state.process.cpuBurst < best.state.process.cpuBurst ? candidate : best,
      )
      : ready[0];
    const [state] = pending.splice(selected.index, 1);
    const end = time + state.remaining;
    state.firstStart = time;
    state.completion = end + state.process.ioBurst;
    addSegment(segments, state.process, time, end, state.process.color);
    time = end;
  }

  return segments;
}

function scheduleRoundRobin(states: ProcessState[], quantum: number): GanttSegment[] {
  const pending = [...states].sort((a, b) => a.process.arrival - b.process.arrival || a.order - b.order);
  const ready: ProcessState[] = [];
  const segments: GanttSegment[] = [];
  let pendingIndex = 0;
  let time = 0;

  while (pendingIndex < pending.length || ready.length > 0) {
    pendingIndex = enqueueArrivals(pending, pendingIndex, ready, time);
    if (ready.length === 0) {
      const nextArrival = pending[pendingIndex].process.arrival;
      addSegment(segments, null, time, nextArrival, '#334155');
      time = nextArrival;
      continue;
    }

    const state = ready.shift()!;
    if (state.firstStart === null) state.firstStart = time;
    const runFor = Math.min(quantum, state.remaining);
    const end = time + runFor;
    addSegment(segments, state.process, time, end, state.process.color);
    state.remaining -= runFor;
    time = end;
    pendingIndex = enqueueArrivals(pending, pendingIndex, ready, time);

    if (state.remaining > 0) {
      ready.push(state);
    } else {
      state.completion = time + state.process.ioBurst;
    }
  }

  return segments;
}

function scheduleCfs(states: ProcessState[]): GanttSegment[] {
  const pending = [...states].sort((a, b) => a.process.arrival - b.process.arrival || a.order - b.order);
  const ready: ProcessState[] = [];
  const segments: GanttSegment[] = [];
  let pendingIndex = 0;
  let time = 0;

  while (pendingIndex < pending.length || ready.length > 0) {
    pendingIndex = enqueueArrivals(pending, pendingIndex, ready, time);
    if (ready.length === 0) {
      const nextArrival = pending[pendingIndex].process.arrival;
      addSegment(segments, null, time, nextArrival, '#334155');
      time = nextArrival;
      continue;
    }

    ready.sort((a, b) => a.virtualRuntime - b.virtualRuntime || a.process.arrival - b.process.arrival || a.order - b.order);
    const state = ready[0];
    if (state.firstStart === null) state.firstStart = time;

    const targetLatency = 6;
    const fairSlice = Math.max(1, Math.floor(targetLatency / ready.length));
    const nextArrival = pending[pendingIndex]?.process.arrival ?? Number.POSITIVE_INFINITY;
    const runFor = Math.min(state.remaining, fairSlice, nextArrival - time);
    const end = time + runFor;
    addSegment(segments, state.process, time, end, state.process.color);
    state.remaining -= runFor;
    state.virtualRuntime += runFor;
    time = end;

    if (state.remaining === 0) {
      state.completion = time + state.process.ioBurst;
      ready.shift();
    }
  }

  return segments;
}

function enqueueArrivals(
  pending: ProcessState[],
  startIndex: number,
  ready: ProcessState[],
  time: number,
): number {
  let index = startIndex;
  while (index < pending.length && pending[index].process.arrival <= time) {
    ready.push(pending[index]);
    index += 1;
  }
  return index;
}

function addSegment(
  segments: GanttSegment[],
  process: Process | null,
  start: number,
  end: number,
  color: string,
): void {
  if (end <= start) return;
  const previous = segments.at(-1);
  const pid = process?.pid ?? null;
  if (previous && previous.pid === pid && previous.end === start) {
    previous.end = end;
    return;
  }
  segments.push({ pid, start, end, color });
}

function calculateMetrics(
  name: SchedulerName,
  states: ProcessState[],
  segments: GanttSegment[],
): SchedulerMetrics {
  if (states.length === 0) {
    return { name, turnaroundTime: 0, waitingTime: 0, responseTime: 0, cpuUtilization: 0, throughput: 0 };
  }

  const firstArrival = Math.min(...states.map(({ process }) => process.arrival));
  const lastCompletion = Math.max(...states.map((state) => state.completion ?? 0));
  const elapsed = lastCompletion - firstArrival;
  const cpuTime = segments.reduce((total, segment) => total + (segment.pid === null ? 0 : segment.end - segment.start), 0);
  const average = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;
  const turnaroundTimes = states.map((state) => (state.completion ?? 0) - state.process.arrival);
  const waitingTimes = states.map((state, index) =>
    turnaroundTimes[index] - state.process.cpuBurst - state.process.ioBurst,
  );
  const responseTimes = states.map((state) => (state.firstStart ?? state.process.arrival) - state.process.arrival);

  return {
    name,
    turnaroundTime: round(average(turnaroundTimes)),
    waitingTime: round(average(waitingTimes)),
    responseTime: round(average(responseTimes)),
    cpuUtilization: elapsed > 0 ? round((cpuTime / elapsed) * 100) : 0,
    throughput: elapsed > 0 ? round(states.length / elapsed, 2) : 0,
  };
}

function round(value: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
