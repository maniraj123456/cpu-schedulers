import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  standalone: true,
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) icon = '';
  @Input() subtitle = '';
  @Input() tone: 'add' | 'queue' | 'timeline' = 'add';
}
