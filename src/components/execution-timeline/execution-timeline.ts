import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { Process } from '../../models/scheduler.models';
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
  @Input() processes: Process[] = [];
  @Input() simulationRun = false;
  readonly activeTab = signal('CFS');
  readonly schedulers = ['CFS', 'RR', 'SJF', 'FCFS'];
}
