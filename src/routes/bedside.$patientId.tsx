import { createFileRoute } from "@tanstack/react-router";
import { BedsideLayout } from "@/components/bedside/BedsideLayout";
import { WS_URL } from "@/config";
import { useVitalsStream } from "@/hooks/useVitalsStream";

export const Route = createFileRoute("/bedside/$patientId")({
  component: BedsideRoute,
});

function BedsideRoute() {
  const { patientId } = Route.useParams();
  useVitalsStream(WS_URL);
  return <BedsideLayout patientId={patientId} />;
}
