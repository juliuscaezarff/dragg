"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon?: string;
  image?: string;
  x: number;
  y: number;
  isImageOnly?: boolean;
}

interface LinkCardProps {
  item: LinkItem;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onRemove: () => void;
}

export default function LinkCard({
  item,
  isSelected,
  onSelect,
  onPositionChange,
  onRemove,
}: LinkCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [faviconPrimaryFailed, setFaviconPrimaryFailed] = useState(false);
  const [faviconDomainFailed, setFaviconDomainFailed] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const vid = u.searchParams.get("v");
        if (vid) return `https://www.youtube.com/embed/${vid}`;
      }
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.split("/").filter(Boolean)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch {}
    return null;
  };

  const getTwitterEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      const isTwitter =
        u.hostname.includes("twitter.com") || u.hostname.includes("x.com");
      if (!isTwitter) return null;

      const idMatch =
        u.pathname.match(/status\/(\d+)/) ||
        u.pathname.match(/i\/web\/status\/(\d+)/) ||
        u.pathname.match(/\/(\d{10,})$/);
      const id = idMatch?.[1];
      if (id) {
        return `https://platform.twitter.com/embed/Tweet.html?id=${id}`;
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    let current = cardRef.current?.parentElement;
    while (current) {
      if (current.style.transform) {
        parentRef.current = current;
        break;
      }
      current = current.parentElement;
    }
  }, []);

  // Finaliza arrasto mesmo saindo do card (ex.: iframe)
  useEffect(() => {
    const onWindowMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // Não seleciona; apenas inicia drag para evitar alteração visual por clique
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current) return;
    e.preventDefault();

    const canvas = cardRef.current.parentElement?.parentElement as HTMLElement;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const transformStr = getComputedStyle(
      cardRef.current.parentElement as HTMLElement
    ).transform;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    if (transformStr && transformStr !== "none") {
      const m2d = transformStr.match(/matrix\(([^)]+)\)/);
      const m3d = transformStr.match(/matrix3d\(([^)]+)\)/);
      const valuesStr = (m2d?.[1] || m3d?.[1]) ?? "";
      const values = valuesStr.split(",").map((v) => parseFloat(v.trim()));
      if (m2d && values.length >= 6) {
        // matrix(a, b, c, d, e, f)
        scale = Number.isNaN(values[0]) ? 1 : values[0];
        translateX = Number.isNaN(values[4]) ? 0 : values[4];
        translateY = Number.isNaN(values[5]) ? 0 : values[5];
      } else if (m3d && values.length >= 16) {
        // matrix3d(... m41, m42, m43, m44)
        scale = Number.isNaN(values[0]) ? 1 : values[0];
        translateX = Number.isNaN(values[12]) ? 0 : values[12];
        translateY = Number.isNaN(values[13]) ? 0 : values[13];
      }
    }

    const newX =
      (e.clientX - canvasRect.left - translateX) / scale - dragOffset.x / scale;
    const newY =
      (e.clientY - canvasRect.top - translateY) / scale - dragOffset.y / scale;

    onPositionChange(item.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (item.isImageOnly) {
    return (
      <div
        ref={cardRef}
        data-card
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="absolute cursor-move group"
        style={{
          left: `${item.x}px`,
          top: `${item.y}px`,
        }}
      >
        <div className="rounded-xl overflow-hidden border border-[#333] bg-[#121212] shadow-lg relative">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-gray-300 truncate max-w-[280px]">
              {item.title || "Imagem"}
            </span>
          </div>
          <div className="p-3">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title || "Imagem"}
              className="block max-w-[600px] max-h-[600px] object-contain rounded-md"
              crossOrigin="anonymous"
              draggable={false}
            />
          </div>
          {/* Botão de apagar aparece no hover, sem alterar layout */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      data-card
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="absolute cursor-move group"
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
      }}
    >
      <div className="bg-[#121212] rounded-xl overflow-hidden border border-[#333] shadow-lg relative w-[360px]">
        <div className="p-3">
          <div className="flex items-start gap-3">
            {(() => {
              const domain = item.url.startsWith("http")
                ? new URL(item.url).hostname
                : undefined;
              const domainIcon = domain
                ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                : undefined;

              let src: string = "/globe.svg";
              if (!faviconPrimaryFailed && item.favicon) {
                src = item.favicon;
              } else if (!faviconDomainFailed && domainIcon) {
                src = domainIcon;
              }

              const handleError = (
                e: React.SyntheticEvent<HTMLImageElement>
              ) => {
                const current = e.currentTarget.src;
                if (item.favicon && current === item.favicon) {
                  setFaviconPrimaryFailed(true);
                } else if (domainIcon && current === domainIcon) {
                  setFaviconDomainFailed(true);
                }
              };

              return (
                <img
                  src={src}
                  alt={domain ? `${domain} favicon` : "favicon"}
                  className="w-10 h-10 rounded shrink-0"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={handleError}
                />
              );
            })()}
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-300 truncate">
                {item.title ||
                  (item.url.startsWith("http")
                    ? new URL(item.url).hostname
                    : item.url)}
              </div>
              <p className="text-sm text-gray-400 truncate">
                {item.description ||
                  (item.url.startsWith("http")
                    ? new URL(item.url).hostname
                    : item.url)}
              </p>
            </div>
          </div>
        </div>
        {/* Rodapé removido para evitar link duplicado */}
        {/* Botão de apagar aparece no hover, sem alterar layout */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 p-1 rounded bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
