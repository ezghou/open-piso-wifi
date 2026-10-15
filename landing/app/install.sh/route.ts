import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/haliknihudas666/open-piso-wifi/main/scripts/install.sh";

export async function GET() {
  // 1. Attempt to fetch latest installer directly from GitHub raw
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const githubRes = await fetch(GITHUB_RAW_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "OpenPisoWiFi-Installer-Gateway",
      },
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (githubRes.ok) {
      const scriptText = await githubRes.text();
      if (scriptText && scriptText.includes("#!/bin/bash")) {
        return new NextResponse(scriptText, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    }
  } catch {
    // If GitHub raw is unreachable or timed out, fall back to bundled file
  }

  // 2. Fallback to local static install.sh
  try {
    const localFilePath = path.join(process.cwd(), "public", "install.sh");
    if (fs.existsSync(localFilePath)) {
      const fileContent = fs.readFileSync(localFilePath, "utf8");
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch {}

  return new NextResponse(
    "#!/bin/bash\necho 'Error: OpenPisoWiFi installer script temporarily unavailable. Please retry in a few moments.'\nexit 1\n",
    {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
