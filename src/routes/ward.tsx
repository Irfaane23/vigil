import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ward")({
  component: WardRoute,
});

function WardRoute() {
  return <main>vigil — ward overview (scaffold)</main>;
}
