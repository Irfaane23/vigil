import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AlarmTier, VitalCode, type VitalReading } from "@/types/vitals";
import { VitalTile } from "./VitalTile";

afterEach(() => {
  cleanup();
});

const sampleReading: VitalReading = {
  patientId: "p-1",
  code: VitalCode.HR,
  value: 92,
  unit: "bpm",
  timestamp: "2026-05-06T10:00:00.000Z",
  isCalculated: false,
};

function renderTile(overrides: Partial<Parameters<typeof VitalTile>[0]> = {}) {
  return render(
    <VitalTile
      code={VitalCode.HR}
      reading={sampleReading}
      history={[]}
      alarmTier={AlarmTier.NORMAL}
      isStale={false}
      {...overrides}
    />,
  );
}

describe("VitalTile", () => {
  it("renders the formatted value when not stale", () => {
    renderTile();
    expect(screen.getByText("92")).toBeDefined();
  });

  it("renders the StaleOverlay when isStale is true", () => {
    renderTile({ isStale: true });
    expect(screen.getByLabelText(/data is stale/i)).toBeDefined();
  });

  it("does not render the StaleOverlay when isStale is false", () => {
    renderTile({ isStale: false });
    expect(screen.queryByLabelText(/data is stale/i)).toBeNull();
  });

  it("renders the calc badge when isCalculated is true", () => {
    renderTile({ isCalculated: true });
    expect(screen.getByText(/calc/i)).toBeDefined();
  });

  it("does not render the calc badge when isCalculated is false", () => {
    renderTile({ isCalculated: false });
    expect(screen.queryByText(/calc/i)).toBeNull();
  });

  it("applies the advisory alarm class to the root", () => {
    renderTile({ alarmTier: AlarmTier.ADVISORY });
    const root = screen.getByRole("button");
    expect(root.className).toContain("advisory");
  });

  it("applies the urgent alarm class to the root", () => {
    renderTile({ alarmTier: AlarmTier.URGENT });
    const root = screen.getByRole("button");
    expect(root.className).toContain("urgent");
  });

  it("applies the emergency alarm class to the root", () => {
    renderTile({ alarmTier: AlarmTier.EMERGENCY });
    const root = screen.getByRole("button");
    expect(root.className).toContain("emergency");
  });

  it("applies the active class when isActive is true", () => {
    renderTile({ isActive: true });
    const root = screen.getByRole("button");
    expect(root.className).toContain("active");
  });

  it("does not apply the active class when isActive is false", () => {
    renderTile({ isActive: false });
    const root = screen.getByRole("button");
    expect(root.className).not.toContain("active");
  });
});
