export class RingBuffer<T> {
  private readonly buf: T[] = [];
  private readonly capacity: number;

  constructor(capacity = 720) {
    this.capacity = capacity;
  }

  push(item: T): void {
    this.buf.push(item);
    if (this.buf.length > this.capacity) {
      this.buf.shift();
    }
  }

  toArray(): T[] {
    return [...this.buf];
  }

  get latest(): T | undefined {
    return this.buf[this.buf.length - 1];
  }

  get length(): number {
    return this.buf.length;
  }
}
