import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { GanttSegment, SchedulerName, SchedulerRun } from '../../models/scheduler.models';
import { SectionHeadingComponent } from '../section-heading/section-heading';

@Component({
  selector: 'app-execution-timeline',
  standalone: true,
  imports: [SectionHeadingComponent],
  templateUrl: './execution-timeline.html',
  styleUrl: './execution-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionTimelineComponent {
  @Input() schedulerRuns: SchedulerRun[] = [];
  @Input() simulationRun = false;
  readonly activeTab = signal<SchedulerName>('CFS');
  readonly schedulers: SchedulerName[] = ['CFS', 'RR', 'SJF', 'FCFS'];

  get activeRun(): SchedulerRun | undefined {
    return this.schedulerRuns.find((run) => run.metrics.name === this.activeTab());
  }

  get legendSegments(): GanttSegment[] {
    const seen = new Set<string>();
    return (this.activeRun?.segments ?? []).filter((segment) => {
      if (segment.pid === null || seen.has(segment.pid)) return false;
      seen.add(segment.pid);
      return true;
    });
  }

  get hasIdleSegment(): boolean {
    return this.activeRun?.segments.some((segment) => segment.pid === null) ?? false;
  }
}
