import { notFound } from "next/navigation";
import ReferenceWorkspace from "@/components/reference/ReferenceWorkspace";

export const dynamic = "force-dynamic";

/**
 * CI-only route for pixel comparison against the immutable vendor reference.
 * It is unavailable unless the ephemeral browser-QA environment enables it.
 */
export default function DesignSystemVisualFixture() {
  if (process.env.MOREAI_VISUAL_QA !== "1") notFound();
  return <ReferenceWorkspace />;
}
