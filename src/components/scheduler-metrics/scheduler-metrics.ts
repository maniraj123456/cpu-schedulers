import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SchedulerMetrics } from '../../models/scheduler.models';
import { SchedulerMetricCardComponent } from '../scheduler-metric-card/scheduler-metric-card';

@Component({
  selector: 'app-scheduler-metrics',
  standalone: true,
  imports: [SchedulerMetricCardComponent],
  templateUrl: './scheduler-metrics.html',
  styleUrl: './scheduler-metrics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerMetricsComponent {
  @Input() metrics: SchedulerMetrics[] = [];
}
