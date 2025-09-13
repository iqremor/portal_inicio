export class Timer {
    constructor(duration, onTick, onEnd) {
        this.duration = duration;
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.interval = null;
    }

    start() {
        this.interval = setInterval(() => {
            this.duration--;
            this.onTick(this.duration);
            if (this.duration <= 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
    }
}
