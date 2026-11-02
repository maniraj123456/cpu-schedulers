import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the simulator with its example processes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Systems Lab');
    expect(compiled.querySelector('header #round-robin-quantum')).not.toBeNull();
    expect(compiled.querySelector('app-scheduler-metrics .run-button')).not.toBeNull();
    expect(compiled.querySelector('header .run-button')).toBeNull();
    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(3);
  });

  it('should add and remove processes through the child components', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const pidInput = compiled.querySelector<HTMLInputElement>('[formControlName="pid"]');
    const form = compiled.querySelector<HTMLFormElement>('form');

    expect(pidInput).not.toBeNull();
    expect(form).not.toBeNull();
    pidInput!.value = 'P4';
    pidInput!.dispatchEvent(new Event('input'));
    form!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(4);
    expect(compiled.textContent).toContain('P4');

    compiled.querySelector<HTMLButtonElement>('[aria-label="Remove process P1"]')!.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(compiled.querySelector('[aria-label="Remove process P1"]')).toBeNull();
  });

  it('should update the Round Robin time quantum with the slider', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const slider = compiled.querySelector<HTMLInputElement>('#round-robin-quantum');

    expect(slider).not.toBeNull();
    expect(slider!.value).toBe('4');

    slider!.value = '8';
    slider!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.querySelector('output[for="round-robin-quantum"]')?.textContent?.trim()).toContain('8');
    expect(fixture.componentInstance.roundRobinQuantum()).toBe(8);
  });

  it('should show calculated metrics and Gantt segments for each scheduler', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('app-scheduler-metrics .run-button')!.click();
    await new Promise((resolve) => setTimeout(resolve, 1250));
    fixture.detectChanges();

    expect(fixture.componentInstance.schedulerRuns()).toHaveLength(4);
    expect(fixture.componentInstance.metrics().every((metric) => metric.turnaroundTime > 0)).toBe(true);
    expect(compiled.querySelectorAll('.metric-card .utilization-track span')).toHaveLength(4);
    for (const scheduler of ['CFS', 'RR', 'SJF', 'FCFS']) {
      const tab = [...compiled.querySelectorAll<HTMLButtonElement>('button[role="tab"]')]
        .find((button) => button.textContent?.trim() === scheduler);
      expect(tab).not.toBeNull();
      tab!.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.timeline-bar')?.getAttribute('aria-label')).toContain(scheduler);
      expect(compiled.querySelectorAll('.timeline-segment').length).toBeGreaterThan(0);
    }
  });
});
