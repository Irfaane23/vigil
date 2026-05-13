import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Alarm } from "@/types/alarm";
import { AlarmTier, VitalCode } from "@/types/vitals";
import { useAlarmStore } from "./alarmStore";

const PATIENT_ID = "p-1";

function makeAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: "alarm-1",
    patientId: PATIENT_ID,
    vitalCode: VitalCode.HR,
    tier: AlarmTier.URGENT,
    triggeredAt: "2026-05-06T10:00:00.000Z",
    currentValue: 162,
    ...overrides,
  };
}

beforeEach(() => {
  useAlarmStore.setState({
    thresholds: {},
    activeAlarms: {},
    silenceRecords: {},
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("alarmStore.upsertAlarm", () => {
  it("creates a new alarm entry under {patientId}:{vitalCode}", () => {
    useAlarmStore.getState().upsertAlarm(makeAlarm());
    const stored = useAlarmStore.getState().activeAlarms[`${PATIENT_ID}:${VitalCode.HR}`];
    expect(stored).toBeDefined();
    expect(stored.tier).toBe(AlarmTier.URGENT);
  });

  it("updates an existing alarm in place", () => {
    useAlarmStore.getState().upsertAlarm(makeAlarm({ tier: AlarmTier.ADVISORY }));
    useAlarmStore
      .getState()
      .upsertAlarm(makeAlarm({ tier: AlarmTier.EMERGENCY, currentValue: 195 }));
    const stored = useAlarmStore.getState().activeAlarms[`${PATIENT_ID}:${VitalCode.HR}`];
    expect(stored.tier).toBe(AlarmTier.EMERGENCY);
    expect(stored.currentValue).toBe(195);
  });
});

describe("alarmStore.silenceAlarm", () => {
  it("creates a SilenceRecord with expiresAt = now + duration", () => {
    vi.useFakeTimers();
    const baseTime = new Date("2026-05-06T10:00:00.000Z");
    vi.setSystemTime(baseTime);

    useAlarmStore.getState().silenceAlarm(`${PATIENT_ID}:${VitalCode.HR}`, 5);
    const record = useAlarmStore.getState().silenceRecords[`${PATIENT_ID}:${VitalCode.HR}`];

    expect(record).toBeDefined();
    expect(record.durationMinutes).toBe(5);
    const expiresAtMs = new Date(record.expiresAt).getTime();
    expect(expiresAtMs).toBe(baseTime.getTime() + 5 * 60 * 1000);
  });
});

describe("alarmStore.isAlarmSilenced", () => {
  it("returns true within the silence window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T10:00:00.000Z"));
    const alarmId = `${PATIENT_ID}:${VitalCode.HR}`;
    useAlarmStore.getState().silenceAlarm(alarmId, 5);

    vi.setSystemTime(new Date("2026-05-06T10:03:00.000Z"));
    expect(useAlarmStore.getState().isAlarmSilenced(alarmId)).toBe(true);
  });

  it("returns false after the window has expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T10:00:00.000Z"));
    const alarmId = `${PATIENT_ID}:${VitalCode.HR}`;
    useAlarmStore.getState().silenceAlarm(alarmId, 5);

    vi.setSystemTime(new Date("2026-05-06T10:06:00.000Z"));
    expect(useAlarmStore.getState().isAlarmSilenced(alarmId)).toBe(false);
  });

  it("returns false when no silence record exists", () => {
    expect(useAlarmStore.getState().isAlarmSilenced("missing:HR")).toBe(false);
  });
});

describe("alarmStore.expireStalesilences", () => {
  it("removes expired records and leaves still-valid ones", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T10:00:00.000Z"));
    useAlarmStore.getState().silenceAlarm("p-1:HR", 2);
    useAlarmStore.getState().silenceAlarm("p-1:SPO2", 15);

    vi.setSystemTime(new Date("2026-05-06T10:05:00.000Z"));
    useAlarmStore.getState().expireStalesilences();

    const records = useAlarmStore.getState().silenceRecords;
    expect(records["p-1:HR"]).toBeUndefined();
    expect(records["p-1:SPO2"]).toBeDefined();
  });
});
