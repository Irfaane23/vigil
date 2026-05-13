import { describe, expect, it } from "vitest";
import { AlarmTier, VitalCode } from "@/types/vitals";
import { DEFAULT_THRESHOLDS, evaluateThreshold } from "./thresholds";

describe("evaluateThreshold", () => {
  const hr = DEFAULT_THRESHOLDS[VitalCode.HR];
  const spo2 = DEFAULT_THRESHOLDS[VitalCode.SPO2];

  it("returns NORMAL for a mid-range value", () => {
    expect(evaluateThreshold(80, hr)).toBe(AlarmTier.NORMAL);
    expect(evaluateThreshold(75, hr)).toBe(AlarmTier.NORMAL);
    expect(evaluateThreshold(95, spo2)).toBe(AlarmTier.NORMAL);
  });

  it("returns ADVISORY at the advisory high boundary", () => {
    expect(evaluateThreshold(hr.advisoryHigh, hr)).toBe(AlarmTier.ADVISORY);
  });

  it("returns ADVISORY at the advisory low boundary", () => {
    expect(evaluateThreshold(hr.advisoryLow, hr)).toBe(AlarmTier.ADVISORY);
  });

  it("returns URGENT at the urgent high boundary", () => {
    expect(evaluateThreshold(hr.urgentHigh, hr)).toBe(AlarmTier.URGENT);
  });

  it("returns URGENT at the urgent low boundary", () => {
    expect(evaluateThreshold(hr.urgentLow, hr)).toBe(AlarmTier.URGENT);
  });

  it("returns EMERGENCY at the emergency high boundary", () => {
    expect(evaluateThreshold(hr.emergencyHigh, hr)).toBe(AlarmTier.EMERGENCY);
  });

  it("returns EMERGENCY at the emergency low boundary", () => {
    expect(evaluateThreshold(hr.emergencyLow, hr)).toBe(AlarmTier.EMERGENCY);
  });

  it("assigns boundary values to the higher severity tier", () => {
    // urgentHigh is also < emergencyHigh — the implementation must report URGENT, not ADVISORY.
    expect(evaluateThreshold(hr.urgentHigh, hr)).toBe(AlarmTier.URGENT);
    // emergencyLow is also <= urgentLow — it must report EMERGENCY, not URGENT.
    expect(evaluateThreshold(hr.emergencyLow, hr)).toBe(AlarmTier.EMERGENCY);
  });

  it("returns ADVISORY just inside the advisory zone", () => {
    expect(evaluateThreshold(hr.advisoryHigh + 1, hr)).toBe(AlarmTier.ADVISORY);
    expect(evaluateThreshold(hr.advisoryLow - 0.5, hr)).toBe(AlarmTier.ADVISORY);
  });

  it("works for low-threshold breaches like SpO2", () => {
    expect(evaluateThreshold(94, spo2)).toBe(AlarmTier.NORMAL);
    expect(evaluateThreshold(spo2.advisoryLow, spo2)).toBe(AlarmTier.ADVISORY);
    expect(evaluateThreshold(spo2.urgentLow, spo2)).toBe(AlarmTier.URGENT);
    expect(evaluateThreshold(spo2.emergencyLow, spo2)).toBe(AlarmTier.EMERGENCY);
    expect(evaluateThreshold(75, spo2)).toBe(AlarmTier.EMERGENCY);
  });
});
