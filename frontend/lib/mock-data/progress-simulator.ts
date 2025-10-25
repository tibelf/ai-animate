export class ProgressSimulator {
  private interval: NodeJS.Timeout | null = null;
  
  start(
    onProgress: (progress: number) => void,
    onComplete: () => void,
    duration: number = 2000
  ) {
    let progress = 0;
    const step = 100 / (duration / 100);
    
    this.interval = setInterval(() => {
      progress += step;
      if (progress >= 100) {
        progress = 100;
        onProgress(100);
        this.stop();
        setTimeout(onComplete, 500);
      } else {
        onProgress(Math.round(progress));
      }
    }, 100);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
