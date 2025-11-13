"use client";

import { FeatureHighlight } from "@/components/feature-highlight";
import { CheckCircle2 } from "lucide-react";

const InlineIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="mx-1 inline-block h-6 w-6 align-middle" />
);

export default function Home() {
  const features = [
    <>
      Grab
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-Et8V2nihjdbUDvyBTTUuuGOgXG91gh.png&w=320&q=75"
        alt="Coffee"
      />
      from the corner cafe.
    </>,
    <>
      Load up your
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-UsyTZyMk2er8VfZu1T68Z4BbnfHYL1.png&w=320&q=75"
        alt="Laptop"
      />
      app.
    </>,
    <>
      Order a new
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-53doFZDyMbmChPPHfnbbPjt0Zvlzq7.png&w=320&q=75"
        alt="Backpack"
      />
      online.
    </>,
    <>
      Have
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-yqO1RPHoOjuNAvqMy997ClCPIwICsb.png&w=320&q=75"
        alt="Gift"
      />
      delivered.
    </>,
    <>
      Subscribe to
      <InlineIcon
        src="https://img.icons8.com/emoji/48/musical-notes-emoji.png"
        alt="Music"
      />
      . Get
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-7A67shmAxn3I6JFLINSfPdOc1q6LzB.png&w=320&q=75"
        alt="Chocolate"
      />
    </>,
    <>from a vending machine.</>,
    <>
      And
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-frBicIvOqd2UwplkxPdk4hRXZZUI5N.png&w=320&q=75"
        alt="Broccoli"
      />
      from the supermarket.
    </>,
  ];

  // Define the footer content
  const footer = (
    <p className="pt-2 text-2xl text-muted-foreground">
      Just look for
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-wmzJ7uOEXwk7xqF9Qkmp7mkvLuwRO5.png&w=320&q=75"
        alt="Apple Pay"
      />
      or
      <InlineIcon
        src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-k0pw2n6xstEEWMtDne6kYddw1cfAsG.png&w=320&q=75"
        alt="NFC"
      />
      when you check out.
    </p>
  );

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-background p-4">
      <FeatureHighlight
        icon={
          <CheckCircle2 className="h-10 w-10 rounded-full bg-blue-500 p-1 text-white" />
        }
        title="Easy. Does it all."
        features={features}
        footer={footer}
      />
    </div>
  );
}
