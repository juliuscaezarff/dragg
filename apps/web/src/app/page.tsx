"use client";

import { FeatureHighlight } from "@/components/feature-highlight";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const InlineIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="mx-1 inline-block h-6 w-6 align-middle" />
);

export default function Home() {
  const features = [
    <>
      An infinite canvas
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-Et8V2nihjdbUDvyBTTUuuGOgXG91gh.png&w=320&q=75"
        alt="Coffee"
      />
      for dragging and dropping anything
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-UsyTZyMk2er8VfZu1T68Z4BbnfHYL1.png&w=320&q=75"
        alt="Laptop"
      />
      you care about.
      <br />
      Unless you forget
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-wmzJ7uOEXwk7xqF9Qkmp7mkvLuwRO5.png&w=320&q=75"
        alt="Apple Pay"
      />
      they’re here.
    </>,
  ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center rounded-lg bg-background p-4">
      <div className="w-full max-w-lg">
        <FeatureHighlight
          icon={
            <Image
              width={40}
              height={40}
              src="/logo.png"
              alt="Dragg"
              className="h-10 w-10 rounded-full bg-primary"
            />
          }
          title="Dragg"
          features={features}
        />
        <div className="mt-2 pl-9">
          <Link href="/login" passHref>
            <Button size="sm" className="rounded-md text-sm font-semibold">
              Start now
              <svg
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
