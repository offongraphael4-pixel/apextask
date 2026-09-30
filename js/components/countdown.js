/**
 * ============================================================================
 * REAL-TIME LEASE COUNTDOWN TIMER COMPONENT
 * ============================================================================
 */

export class CountdownTimer {
  constructor(expiresAtMs, onTick, onExpire) {
    this.expiresAtMs = expiresAtMs;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.intervalId = null;
    this.start();
  }

  start() {
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  update() {
    const now = Date.now();
    const remainingMs = Math.max(0, this.expiresAtMs - now);

    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const percent = Math.min(100, Math.max(0, (remainingMs / (45 * 60 * 1000)) * 100));

    if (this.onTick) {
      this.onTick({ formatted, totalSeconds, minutes, seconds, percent });
    }

    if (remainingMs <= 0) {
      this.stop();
      if (this.onExpire) this.onExpire();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
