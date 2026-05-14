import { useEffect, useRef, useState } from "react";
import { useAlarmStore } from "@/store/alarmStore";
import { useAnnotationStore } from "@/store/annotationStore";
import { useVitalsStore } from "@/store/vitalsStore";
import { MOCK_PATIENTS } from "@/config";
import type { FhirObservation } from "@/types/fhir";
import { AlarmTier, ConnectionStatus, VitalCode } from "@/types/vitals";
import type { VitalReading } from "@/types/vitals";
import { evaluateThreshold } from "@/utils/thresholds";
import { isStale } from "@/utils/vitalMath";

/**
 * Single connection, multi-patient ingestion.
 *
 * One WebSocket carries observations for every patient on the ward.
 * `handleMessage` extracts `patientId` from the FHIR `subject.reference`
 * field on each message and routes to the correct keyed slot in the stores,
 * so callers do NOT instantiate this hook per patient, mounting it once at
 * the route level is enough to keep all four mock patients live.
 */

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const STALE_THRESHOLD_MS = 90_000;
const STALE_CHECK_INTERVAL_MS = 10_000;
const SILENCE_EXPIRY_INTERVAL_MS = 30_000;

const STATUS_SEVERITY: Record<ConnectionStatus, number> = {
  [ConnectionStatus.LIVE]: 0,
  [ConnectionStatus.RECONNECTING]: 1,
  [ConnectionStatus.STALE]: 2,
  [ConnectionStatus.DISCONNECTED]: 3,
};

const LOINC_TO_VITAL: Readonly<Record<string, VitalCode>> = {
  "8867-4": VitalCode.HR,
  "2708-6": VitalCode.SPO2,
  "8480-6": VitalCode.SBP,
  "8462-4": VitalCode.DBP,
  "8478-0": VitalCode.MAP,
  "9279-1": VitalCode.RR,
  "8310-5": VitalCode.TEMP,
  "9269-2": VitalCode.GCS,
};

function handleMessage(event: MessageEvent<string>): void {
  let obs: FhirObservation;
  try {
    obs = JSON.parse(event.data) as FhirObservation;
  } catch {
    return;
  }

  const loincCode = obs.code.coding[0]?.code;
  const vitalCode = loincCode !== undefined ? LOINC_TO_VITAL[loincCode] : undefined;
  if (vitalCode === undefined) return;

  const quantity = obs.valueQuantity;
  if (quantity === undefined) return;

  const patientId = obs.subject.reference.replace("Patient/", "");

  const reading: VitalReading = {
    patientId,
    code: vitalCode,
    value: quantity.value,
    unit: quantity.unit,
    timestamp: obs.effectiveDateTime,
    isCalculated: vitalCode === VitalCode.MAP,
  };

  useVitalsStore.getState().addReading(reading);

  const threshold = useAlarmStore.getState().getThreshold(patientId, vitalCode);
  const tier = evaluateThreshold(quantity.value, threshold);

  if (tier === AlarmTier.NORMAL) {
    useAlarmStore.getState().clearAlarm(patientId, vitalCode);
  } else {
    useAlarmStore.getState().upsertAlarm({
      id: `${patientId}:${vitalCode}`,
      patientId,
      vitalCode,
      tier,
      triggeredAt: obs.effectiveDateTime,
      currentValue: quantity.value,
    });
  }
}

export function useVitalsStream(wsUrl: string): { connectionStatus: ConnectionStatus } {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.LIVE);
  const wsRef = useRef<WebSocket | null>(null);
  const attemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Register mock patients and hydrate their annotations before connecting.
    const vitalsStore = useVitalsStore.getState();
    const annotationStore = useAnnotationStore.getState();
    for (const patient of MOCK_PATIENTS) {
      vitalsStore.registerPatient(patient);
      annotationStore.loadAnnotations(patient.id);
    }

    let cancelled = false;
    let wsStatus: ConnectionStatus = ConnectionStatus.LIVE;

    function updateAggregate(): void {
      if (cancelled) return;
      const patients = Object.values(useVitalsStore.getState().patients);
      const worst = patients.reduce<ConnectionStatus>((acc, s) => {
        return STATUS_SEVERITY[s.connectionStatus] > STATUS_SEVERITY[acc]
          ? s.connectionStatus
          : acc;
      }, wsStatus);
      setConnectionStatus(worst);
    }

    function connect(): void {
      if (cancelled) return;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        wsStatus = ConnectionStatus.LIVE;
        updateAggregate();
      };

      ws.onmessage = handleMessage;
      ws.onerror = () => ws.close();

      ws.onclose = () => {
        if (cancelled) return;
        if (attemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
          wsStatus = ConnectionStatus.DISCONNECTED;
          updateAggregate();
          return;
        }
        wsStatus = ConnectionStatus.RECONNECTING;
        updateAggregate();
        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * Math.pow(2, attemptRef.current),
          RECONNECT_MAX_DELAY_MS,
        );
        attemptRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    const staleInterval = setInterval(() => {
      if (cancelled) return;
      const store = useVitalsStore.getState();
      for (const [patientId, session] of Object.entries(store.patients)) {
        if (
          session.lastMessageAt !== undefined &&
          isStale(session.lastMessageAt, STALE_THRESHOLD_MS)
        ) {
          store.setConnectionStatus(patientId, ConnectionStatus.STALE);
        }
      }
      updateAggregate();
    }, STALE_CHECK_INTERVAL_MS);

    const silenceInterval = setInterval(() => {
      useAlarmStore.getState().expireStalesilences();
    }, SILENCE_EXPIRY_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      clearInterval(staleInterval);
      clearInterval(silenceInterval);
    };
  }, [wsUrl]);

  return { connectionStatus };
}
