import { beforeEach, describe, expect, it } from "vitest";
import { useAnnotationStore } from "./annotationStore";

const PATIENT_ID = "p-1";
const STORAGE_KEY = `vigil_annotations_${PATIENT_ID}`;

beforeEach(() => {
  useAnnotationStore.setState({ annotations: {} });
  localStorage.clear();
});

describe("annotationStore.addAnnotation", () => {
  it("adds entry to the in-memory store", () => {
    useAnnotationStore.getState().addAnnotation({
      patientId: PATIENT_ID,
      timestamp: "2026-05-06T10:00:00.000Z",
      text: "Vasopressor started",
      author: "DC",
    });
    const stored = useAnnotationStore.getState().getAnnotations(PATIENT_ID);
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe("Vasopressor started");
    expect(stored[0].id).toMatch(/^p-1-/);
  });

  it("persists to localStorage under the correct key", () => {
    useAnnotationStore.getState().addAnnotation({
      patientId: PATIENT_ID,
      timestamp: "2026-05-06T10:00:00.000Z",
      text: "Position change",
      author: "DC",
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed: unknown = JSON.parse(raw ?? "[]");
    expect(Array.isArray(parsed)).toBe(true);
    if (Array.isArray(parsed)) {
      expect(parsed).toHaveLength(1);
    }
  });

  it("places newer entries at the front (unshift order)", () => {
    const store = useAnnotationStore.getState();
    store.addAnnotation({
      patientId: PATIENT_ID,
      timestamp: "2026-05-06T10:00:00.000Z",
      text: "First",
      author: "DC",
    });
    store.addAnnotation({
      patientId: PATIENT_ID,
      timestamp: "2026-05-06T10:05:00.000Z",
      text: "Second",
      author: "DC",
    });
    const list = useAnnotationStore.getState().getAnnotations(PATIENT_ID);
    expect(list[0].text).toBe("Second");
    expect(list[1].text).toBe("First");
  });
});

describe("annotationStore.loadAnnotations", () => {
  it("hydrates store from localStorage correctly", () => {
    const seed = [
      {
        id: "a-1",
        patientId: PATIENT_ID,
        timestamp: "2026-05-06T10:00:00.000Z",
        text: "First",
        author: "DC",
      },
      {
        id: "a-2",
        patientId: PATIENT_ID,
        timestamp: "2026-05-06T10:05:00.000Z",
        text: "Second",
        author: "DC",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    useAnnotationStore.getState().loadAnnotations(PATIENT_ID);

    const list = useAnnotationStore.getState().getAnnotations(PATIENT_ID);
    expect(list).toHaveLength(2);
    // Sorted desc by timestamp
    expect(list[0].id).toBe("a-2");
    expect(list[1].id).toBe("a-1");
  });

  it("is a no-op when nothing is stored", () => {
    useAnnotationStore.getState().loadAnnotations(PATIENT_ID);
    expect(useAnnotationStore.getState().getAnnotations(PATIENT_ID)).toEqual([]);
  });

  it("handles malformed localStorage data without throwing", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(() => useAnnotationStore.getState().loadAnnotations(PATIENT_ID)).not.toThrow();
    expect(useAnnotationStore.getState().getAnnotations(PATIENT_ID)).toEqual([]);
  });

  it("ignores non-array shapes in localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ wrong: "shape" }));
    useAnnotationStore.getState().loadAnnotations(PATIENT_ID);
    expect(useAnnotationStore.getState().getAnnotations(PATIENT_ID)).toEqual([]);
  });
});

describe("annotationStore.getAnnotations", () => {
  it("returns entries sorted by timestamp descending after load", () => {
    const seed = [
      {
        id: "a",
        patientId: PATIENT_ID,
        timestamp: "2026-05-06T10:01:00.000Z",
        text: "A",
        author: "DC",
      },
      {
        id: "c",
        patientId: PATIENT_ID,
        timestamp: "2026-05-06T10:03:00.000Z",
        text: "C",
        author: "DC",
      },
      {
        id: "b",
        patientId: PATIENT_ID,
        timestamp: "2026-05-06T10:02:00.000Z",
        text: "B",
        author: "DC",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    useAnnotationStore.getState().loadAnnotations(PATIENT_ID);

    const list = useAnnotationStore.getState().getAnnotations(PATIENT_ID);
    expect(list.map((a) => a.id)).toEqual(["c", "b", "a"]);
  });

  it("returns empty array for unknown patient", () => {
    expect(useAnnotationStore.getState().getAnnotations("unknown")).toEqual([]);
  });
});
