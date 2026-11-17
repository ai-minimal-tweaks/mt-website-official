"use client";

import { useEffect, useState } from "react";
import FlexCarousel, { type FlexCarouselItem } from "@/components/motion/FlexCarousel";
import { homeV2 } from "@/content/home-v2";

const W = 720;
const H = 400;

/** Paints one brand card (name + optional green "Live" tag) to an image the WebGL carousel can use as a texture. */
function paintCard(name: string, live: boolean, family: string, dark: boolean) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const r = 44;
  const round = (inset: number) => {
    x.beginPath();
    x.roundRect(inset, inset, W - inset * 2, H - inset * 2, r - inset);
  };

  if (dark) {
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, live ? "#1d0c05" : "#151515");
    g.addColorStop(1, live ? "#3a1406" : "#202020");
    x.fillStyle = g;
  } else x.fillStyle = live ? "#ffffff" : "#efefee";
  x.fillRect(0, 0, W, H);

  if (live) {
    round(5);
    x.lineWidth = 6;
    x.strokeStyle = dark ? "#FE9004" : "#2fa35a";
    x.stroke();
    // "● Live" tag
    x.font = `600 30px ${family}`;
    const tw = x.measureText("Live").width;
    x.fillStyle = dark ? "rgba(254,144,4,.16)" : "#e8f7ec";
    x.beginPath();
    x.roundRect(40, 40, tw + 78, 56, 14);
    x.fill();
    x.fillStyle = dark ? "#FE9004" : "#2fa35a";
    x.beginPath();
    x.arc(70, 68, 8, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = dark ? "#ffd29a" : "#2fa35a";
    x.textBaseline = "middle";
    x.fillText("Live", 90, 69);
  }

  // Brand name, shrunk to fit long names.
  let size = 78;
  x.font = `600 ${size}px ${family}`;
  while (x.measureText(name).width > W - 110 && size > 30) x.font = `600 ${(size -= 2)}px ${family}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillStyle = dark ? (live ? "#ffffff" : "rgba(255,255,255,.55)") : live ? "#111111" : "#8d8d8b";
  x.fillText(name, W / 2, H / 2 + (live ? 26 : 6));
  return c.toDataURL("image/png");
}

/**
 * "Brands we've tweaked": React Bits FlexCarousel (WebGL lens that bends the cards as they pass the centre).
 * Drag, swipe, scroll or use the arrow keys; it also drifts on its own.
 */
export function BrandsCarousel({
  dark = false,
  play,
  cardHeight = 0.62,
  className = "",
}: {
  dark?: boolean;
  play: boolean;
  /** Card height as a share of the carousel height. */
  cardHeight?: number;
  className?: string;
}) {
  const [items, setItems] = useState<FlexCarouselItem[] | null>(null);

  useEffect(() => {
    if (!play) return;
    const paint = () => {
      const family = getComputedStyle(document.body).fontFamily;
      setItems(
        homeV2.brands.map((b) => ({
          src: paintCard(b.name, b.live, family, dark),
          alt: b.name,
          title: b.name,
          subtitle: b.live ? "Live now" : undefined,
        })),
      );
    };
    if (document.fonts?.status === "loaded") paint();
    else document.fonts?.ready.then(paint) ?? paint();
  }, [play, dark]);

  return (
    <div className={className}>
      {items && (
        <FlexCarousel
          items={items}
          preset="ribbon"
          intro="deal"
          cardHeight={cardHeight}
          gap={18}
          radius={18}
          fit="natural"
          label={homeV2.brandsLabel}
          autoplay
          interval={2.6}
          captions={false}
          captureWheel={false}
          focusOnClick={false}
          className="text-ink [&>canvas]:absolute [&>canvas]:inset-0"
        />
      )}
    </div>
  );
}
