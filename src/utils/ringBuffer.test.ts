import { describe, expect, it } from "vitest";
import { RingBuffer } from "./ringBuffer";

describe("RingBuffer", () => {
  it("respects capacity - drops oldest when full", () => {
    const buf = new RingBuffer<number>(3);
    buf.push(1);
    buf.push(2);
    buf.push(3);
    buf.push(4);
    expect(buf.length).toBe(3);
    expect(buf.toArray()).toEqual([2, 3, 4]);
  });

  it("toArray returns values in insertion order", () => {
    const buf = new RingBuffer<number>(5);
    buf.push(10);
    buf.push(20);
    buf.push(30);
    expect(buf.toArray()).toEqual([10, 20, 30]);
  });

  it("toArray returns a copy, not a live reference", () => {
    const buf = new RingBuffer<number>(5);
    buf.push(1);
    buf.push(2);
    const snapshot = buf.toArray();
    buf.push(3);
    expect(snapshot).toEqual([1, 2]);
  });

  it("latest returns the most recently pushed value", () => {
    const buf = new RingBuffer<string>(4);
    buf.push("a");
    buf.push("b");
    buf.push("c");
    expect(buf.latest).toBe("c");
  });

  it("latest returns undefined on an empty buffer", () => {
    const buf = new RingBuffer<number>(4);
    expect(buf.latest).toBeUndefined();
  });

  it("length reflects pushes up to capacity", () => {
    const buf = new RingBuffer<number>(2);
    expect(buf.length).toBe(0);
    buf.push(1);
    expect(buf.length).toBe(1);
    buf.push(2);
    expect(buf.length).toBe(2);
    buf.push(3);
    expect(buf.length).toBe(2);
  });

  it("uses a default capacity of 720", () => {
    const buf = new RingBuffer<number>();
    for (let i = 0; i < 800; i += 1) buf.push(i);
    expect(buf.length).toBe(720);
    expect(buf.toArray()[0]).toBe(80);
    expect(buf.latest).toBe(799);
  });
});
