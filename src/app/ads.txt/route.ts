import { ADSENSE_PUBLISHER_ID } from "@/config/site";

/**
 * Serves /ads.txt. Until NEXT_PUBLIC_ADSENSE_PUBLISHER_ID is set, the file
 * contains only a comment so no fake seller line is ever published. Once you
 * have a publisher id (format pub-XXXXXXXXXXXXXXXX), the standard AdSense line
 * is emitted automatically.
 */
export const dynamic = "force-static";

export function GET() {
  const body = ADSENSE_PUBLISHER_ID
    ? `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt placeholder — set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID to publish the AdSense line.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
