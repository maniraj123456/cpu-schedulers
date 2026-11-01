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
});
