import type { Patient } from "@/types/patient";

export const WS_URL = "ws://localhost:8080";

// Replaced by a patient-roster API call when FastAPI takes over.
export const MOCK_PATIENTS: readonly Patient[] = [
  {
    id: "patient-1",
    name: "Alice Martin",
    bedNumber: "Bed 1",
    admittedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "patient-2",
    name: "Robert Chen",
    bedNumber: "Bed 2",
    admittedAt: "2024-01-01T08:30:00.000Z",
  },
  {
    id: "patient-3",
    name: "Sarah Johnson",
    bedNumber: "Bed 3",
    admittedAt: "2024-01-01T09:00:00.000Z",
  },
  {
    id: "patient-4",
    name: "David Williams",
    bedNumber: "Bed 4",
    admittedAt: "2024-01-01T10:15:00.000Z",
  },
];
