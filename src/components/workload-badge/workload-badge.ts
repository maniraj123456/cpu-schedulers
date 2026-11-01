import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProcessType } from '../../models/scheduler.models';

@Component({
  selector: 'app-workload-badge',
  standalone: true,
  templateUrl: './workload-badge.html',
  styleUrl: './workload-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkloadBadgeComponent {
  @Input({ required: true }) type!: ProcessType;
}
