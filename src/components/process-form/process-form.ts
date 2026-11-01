import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcessDraft, ProcessType } from '../../models/scheduler.models';
import { SectionHeadingComponent } from '../section-heading/section-heading';

@Component({
  selector: 'app-process-form',
  standalone: true,
  imports: [ReactiveFormsModule, SectionHeadingComponent],
  templateUrl: './process-form.html',
  styleUrl: './process-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  @Input() nextPid = 'P1';
  @Output() processAdded = new EventEmitter<ProcessDraft>();

  readonly form = this.fb.group({
    pid: ['P1', Validators.required],
    arrival: [0, [Validators.required, Validators.min(0)]],
    cpuBurst: [10, [Validators.required, Validators.min(1)]],
    ioBurst: [2, [Validators.required, Validators.min(0)]],
    type: this.fb.control<ProcessType>('CPU-Bound', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nextPid']) {
      this.form.patchValue({ pid: this.nextPid });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { pid, arrival, cpuBurst, ioBurst, type } = this.form.getRawValue();
    if (pid === null || arrival === null || cpuBurst === null || ioBurst === null || type === null) {
      return;
    }

    this.processAdded.emit({ pid, arrival, cpuBurst, ioBurst, type });
  }
}
