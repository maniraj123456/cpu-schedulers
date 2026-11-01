import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SectionHeadingComponent } from '../section-heading/section-heading';
import { WorkloadBadgeComponent } from '../workload-badge/workload-badge';
import { Process } from '../../models/scheduler.models';

@Component({
  selector: 'app-process-queue',
  standalone: true,
  imports: [SectionHeadingComponent, WorkloadBadgeComponent],
  templateUrl: './process-queue.html',
  styleUrl: './process-queue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessQueueComponent {
  @Input() processes: Process[] = [];
  @Output() processRemoved = new EventEmitter<string>();
}
