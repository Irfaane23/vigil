import type { ConnectionStatus } from "./vitals";

export interface Patient {
  readonly id: string;
  readonly name: string;
  readonly bedNumber: string;
  readonly admittedAt: string;
  readonly age?: number;
  readonly mrn?: string;
}

export interface PatientSession {
  readonly patient: Patient;
  connectionStatus: ConnectionStatus;
  lastMessageAt: string | undefined;
}
