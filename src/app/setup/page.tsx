// app/setup/page.tsx
import { syncVideos } from "@/lib/syncVideos";

export default async function SetupPage() {
  await syncVideos();
  return <div>Initial sync completed!</div>;
}
