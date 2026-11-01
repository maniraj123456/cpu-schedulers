import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SchedulerMetrics } from '../../models/scheduler.models';

@Component({
  selector: 'app-scheduler-metric-card',
  standalone: true,
  templateUrl: './scheduler-metric-card.html',
  styleUrl: './scheduler-metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerMetricCardComponent {
  @Input({ required: true }) metric!: SchedulerMetrics;
}
