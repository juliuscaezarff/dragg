"use client";

import React from "react";
import { useRef, useState } from "react";
import LinkCard from "./link-card";

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

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<LinkItem[]>([]);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Converte coordenadas do ponteiro (viewport) para coordenadas do board (antes do transform)
  const toBoardCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: (clientY - rect.top - pan.y) / scale,
    };
  };

  // Posição central visível do board
  const getCenterBoardPos = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: -pan.x / scale, y: -pan.y / scale };
    return toBoardCoords(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  const fetchLinkMetadata = async (url: string) => {
    try {
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) throw new Error("Failed to fetch metadata");
      return await response.json();
    } catch (error) {
      console.error("[v0] Error fetching metadata:", error);
      return {
        title: new URL(url).hostname,
        description: url,
        favicon: `https://www.google.com/s2/favicons?domain=${
          new URL(url).hostname
        }&sz=64`,
      };
    }
  };

  const getRandomPosition = () => {
    const minX = 50;
    const minY = 50;
    const maxX = 800;
    const maxY = 600;
    return {
      x: Math.random() * (maxX - minX) + minX - pan.x / scale,
      y: Math.random() * (maxY - minY) + minY - pan.y / scale,
    };
  };

  const addLink = async (url: string, pos?: { x: number; y: number }) => {
    if (!url.trim()) return;

    // Validate URL
    try {
      new URL(url);
    } catch {
      return;
    }

    const position = pos ?? getRandomPosition();
    const id = Date.now().toString();

    // Inclusão otimista: adiciona imediatamente com dados básicos
    const domain = new URL(url).hostname;
    const optimisticItem: LinkItem = {
      id,
      url,
      title: domain,
      description: url,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      image: undefined,
      x: position.x,
      y: position.y,
    };

    setItems((prev) => [...prev, optimisticItem]);

    // Busca metadata e atualiza o item quando chegar
    try {
      const metadata = await fetchLinkMetadata(url);
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                title: metadata.title || it.title,
                description: metadata.description || it.description,
                favicon: metadata.favicon || it.favicon,
                image: metadata.image || it.image,
              }
            : it
        )
      );
    } catch {
      // mantém otimista caso falhe
    }
  };

  const addImageFile = async (file: File, pos?: { x: number; y: number }) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const position = pos ?? getRandomPosition();

      const newItem: LinkItem = {
        id: Date.now().toString() + Math.random(),
        url: imageUrl,
        title: file.name,
        description: "",
        image: imageUrl,
        x: position.x,
        y: position.y,
        isImageOnly: true,
      };

      setItems((prev) => [...prev, newItem]);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const dropPos = toBoardCoords(e.clientX, e.clientY);

    if (e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        // Pequeno deslocamento entre múltiplos arquivos para evitar sobreposição completa
        const offsetPos = { x: dropPos.x + i * 20, y: dropPos.y + i * 20 };
        addImageFile(e.dataTransfer.files[i], offsetPos);
      }
    }

    const text =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain");
    if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
      addLink(text, dropPos);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    // Aceita paste de qualquer lugar (sem exigir foco em input)
    const itemsData = e.clipboardData?.items;
    if (!itemsData) return;

    for (let i = 0; i < itemsData.length; i++) {
      const it = itemsData[i];

      if (it.type.startsWith("image/")) {
        const file = it.getAsFile();
        if (file) addImageFile(file, getCenterBoardPos());
      } else if (it.type === "text/plain") {
        it.getAsString((text) => {
          const trimmed = text.trim();
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            addLink(trimmed, getCenterBoardPos());
          }
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-card]")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Always handle wheel for board zoom to avoid browser page zoom
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.1), 5);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const scaleDiff = newScale - scale;
    setPan({
      x: pan.x - cursorX * scaleDiff,
      y: pan.y - cursorY * scaleDiff,
    });

    setScale(newScale);
  };

  const updateItemPosition = (id: string, x: number, y: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste as EventListener);
    return () =>
      document.removeEventListener("paste", handlePaste as EventListener);
  }, [pan, scale]);

  return (
    <div className="w-full h-screen bg-[#1a1a1a] overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {items.map((item) => (
            <LinkCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onPositionChange={updateItemPosition}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
