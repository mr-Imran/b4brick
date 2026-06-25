import { HomeClient } from "@/components/HomeClient";
import { FRAME_PRELOAD_HINTS, getFramePath } from "@/lib/frames";

export default function Home() {
  return (
    <>
      {Array.from({ length: FRAME_PRELOAD_HINTS }, (_, i) => (
        <link key={i} rel="preload" as="image" href={getFramePath(i)} />
      ))}
      <HomeClient />
    </>
  );
}
