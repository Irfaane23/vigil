export interface FhirCoding {
  readonly system: string;
  readonly code: string;
  readonly display: string;
}

export interface FhirQuantity {
  readonly value: number;
  readonly unit: string;
  readonly system: string;
  readonly code: string;
}

export interface FhirObservation {
  readonly resourceType: "Observation";
  readonly id: string;
  readonly status: "final" | "preliminary" | "amended";
  readonly code: {
    readonly coding: readonly FhirCoding[];
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly effectiveDateTime: string;
  readonly valueQuantity?: FhirQuantity;
  readonly component?: readonly {
    readonly code: {
      readonly coding: readonly FhirCoding[];
    };
    readonly valueQuantity: FhirQuantity;
  }[];
}
