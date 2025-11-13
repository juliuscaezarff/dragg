import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    const html = await response.text();

    const toAbsolute = (href: string | undefined) => {
      if (!href) return undefined;
      try {
        if (href.startsWith("http://") || href.startsWith("https://")) {
          return href;
        }
        const base = new URL(url).origin;
        if (href.startsWith("/")) return `${base}${href}`;
        return `${base}/${href}`;
      } catch {
        return undefined;
      }
    };

    const titleMatch = html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
    );
    const descriptionMatch =
      html.match(
        /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      );
    const imageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
    );

    const title = titleMatch?.[1] || new URL(url).hostname;
    const description = descriptionMatch?.[1] || url;
    const image = toAbsolute(imageMatch?.[1]);

    const domain = new URL(url).hostname;
    // Tenta encontrar um link rel=icon/shortcut-icon/apple-touch-icon
    const iconLinkMatch =
      html.match(
        /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i
      ) ||
      html.match(
        /<link[^>]+rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i
      );
    const faviconAbs =
      toAbsolute(iconLinkMatch?.[1]) || toAbsolute("/favicon.ico");
    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const favicon = faviconAbs || fallbackFavicon;

    return NextResponse.json({
      title,
      description,
      image,
      favicon,
    });
  } catch (error) {
    console.error("[v0] Error fetching metadata:", error);

    return NextResponse.json(
      {
        title: new URL(url).hostname,
        description: url,
        favicon: `https://www.google.com/s2/favicons?domain=${
          new URL(url).hostname
        }&sz=64`,
      },
      { status: 200 }
    );
  }
}
