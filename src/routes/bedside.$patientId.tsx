import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bedside/$patientId")({
  component: BedsideRoute,
});

function BedsideRoute() {
  const { patientId } = Route.useParams();
  return <main>vigil — bedside for {patientId} (scaffold)</main>;
}
