import { createFileRoute } from "@tanstack/react-router";
import { WardView } from "@/components/ward/WardView";
import { WS_URL } from "@/config";
import { useVitalsStream } from "@/hooks/useVitalsStream";

export const Route = createFileRoute("/ward")({
  component: WardRoute,
});

function WardRoute() {
  useVitalsStream(WS_URL);
  return <WardView />;
}
