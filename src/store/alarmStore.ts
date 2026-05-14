import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Alarm, AlarmThreshold, SilenceRecord } from "@/types/alarm";
import type { VitalCode } from "@/types/vitals";
import { DEFAULT_THRESHOLDS } from "@/utils/thresholds";

/**
 * Multi-patient alarm store.
 *
 *   thresholds[patientId][vitalCode]              -> optional override
 *                                                   (falls back to DEFAULT_THRESHOLDS)
 *   activeAlarms[`${patientId}:${vitalCode}`]     -> currently-firing Alarm
 *   silenceRecords[`${patientId}:${vitalCode}`]   -> SilenceRecord while active
 *
 * Composite-key strings keep collisions impossible across patients/vitals.
 * The same store instance serves the bedside view, ward view, and any
 * future workflows that surface alarm state.
 */

type AlarmState = {
  thresholds: Record<string, Partial<Record<VitalCode, AlarmThreshold>>>;
  activeAlarms: Record<string, Alarm>;
  silenceRecords: Record<string, SilenceRecord>;
  upsertAlarm: (alarm: Alarm) => void;
  clearAlarm: (patientId: string, code: VitalCode) => void;
  silenceAlarm: (alarmId: string, durationMinutes: number) => void;
  isAlarmSilenced: (alarmId: string) => boolean;
  expireStalesilences: () => void;
  getThreshold: (patientId: string, code: VitalCode) => AlarmThreshold;
};

export const useAlarmStore = create<AlarmState>()(
  immer((set, get) => ({
    thresholds: {},
    activeAlarms: {},
    silenceRecords: {},

    upsertAlarm: (alarm) =>
      set((state) => {
        state.activeAlarms[`${alarm.patientId}:${alarm.vitalCode}`] = alarm;
      }),

    clearAlarm: (patientId, code) =>
      set((state) => {
        delete state.activeAlarms[`${patientId}:${code}`];
      }),

    silenceAlarm: (alarmId, durationMinutes) =>
      set((state) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
        state.silenceRecords[alarmId] = {
          alarmId,
          silencedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          durationMinutes,
        };
      }),

    isAlarmSilenced: (alarmId) => {
      const record = get().silenceRecords[alarmId];
      if (!record) return false;
      return new Date(record.expiresAt).getTime() > Date.now();
    },

    expireStalesilences: () =>
      set((state) => {
        const now = Date.now();
        for (const key of Object.keys(state.silenceRecords)) {
          if (new Date(state.silenceRecords[key].expiresAt).getTime() <= now) {
            delete state.silenceRecords[key];
          }
        }
      }),

    getThreshold: (patientId, code) => {
      const override = get().thresholds[patientId]?.[code];
      return override ?? DEFAULT_THRESHOLDS[code];
    },
  })),
);
