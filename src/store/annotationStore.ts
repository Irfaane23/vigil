import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Annotation } from "@/types/annotation";

const storageKey = (patientId: string) => `vigil_annotations_${patientId}`;

type AnnotationState = {
  annotations: Record<string, Annotation[]>;
  addAnnotation: (partial: Omit<Annotation, "id">) => void;
  loadAnnotations: (patientId: string) => void;
  getAnnotations: (patientId: string) => Annotation[];
};

export const useAnnotationStore = create<AnnotationState>()(
  immer((set, get) => ({
    annotations: {},

    addAnnotation: (partial) =>
      set((state) => {
        const annotation: Annotation = {
          ...partial,
          id: `${partial.patientId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        };
        if (!state.annotations[partial.patientId]) {
          state.annotations[partial.patientId] = [];
        }
        state.annotations[partial.patientId].unshift(annotation);
        try {
          localStorage.setItem(
            storageKey(partial.patientId),
            JSON.stringify(state.annotations[partial.patientId]),
          );
        } catch {
          // localStorage may be unavailable (e.g. private browsing restrictions)
        }
      }),

    loadAnnotations: (patientId) =>
      set((state) => {
        try {
          const raw = localStorage.getItem(storageKey(patientId));
          if (!raw) return;
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const sorted = (parsed as Annotation[]).sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            );
            state.annotations[patientId] = sorted;
          }
        } catch {
          // ignore malformed localStorage data
        }
      }),

    getAnnotations: (patientId) => get().annotations[patientId] ?? [],
  })),
);
