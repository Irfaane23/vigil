import type { Patient } from "@/types/patient";

export const WS_URL = "ws://localhost:8080";

// Replaced by a patient-roster API call when FastAPI takes over.
export const MOCK_PATIENTS: readonly Patient[] = [
  {
    id: "patient-1",
    name: "Alice Martin",
    bedNumber: "Bed UC-001",
    admittedAt: "2024-01-01T08:00:00.000Z",
    age: 67,
    mrn: "MRN-100214",
  },
  {
    id: "patient-2",
    name: "Robert Chen",
    bedNumber: "Bed UC-002",
    admittedAt: "2024-01-01T08:30:00.000Z",
    age: 54,
    mrn: "MRN-100215",
  },
  {
    id: "patient-3",
    name: "Sarah Johnson",
    bedNumber: "Bed UC-003",
    admittedAt: "2024-01-01T09:00:00.000Z",
    age: 72,
    mrn: "MRN-100216",
  },
  {
    id: "patient-4",
    name: "David Williams",
    bedNumber: "Bed UC-004",
    admittedAt: "2024-01-01T10:15:00.000Z",
    age: 45,
    mrn: "MRN-100217",
  },
];
