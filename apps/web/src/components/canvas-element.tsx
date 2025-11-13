"use client";

import type React from "react";

import { useState, useRef } from "react";
import { X } from "lucide-react";

interface CanvasItem {
  id: string;
  type: "image";
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasElementProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onRemove: () => void;
}

export default function CanvasElement({
  item,
  isSelected,
  onSelect,
  onPositionChange,
  onRemove,
}: CanvasElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    onSelect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !elementRef.current?.parentElement?.parentElement)
      return;

    const canvas = elementRef.current.parentElement.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    const transformStr = getComputedStyle(
      elementRef.current.parentElement
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
        scale = Number.isNaN(values[0]) ? 1 : values[0];
        translateX = Number.isNaN(values[4]) ? 0 : values[4];
        translateY = Number.isNaN(values[5]) ? 0 : values[5];
      } else if (m3d && values.length >= 16) {
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

  return (
    <div
      ref={elementRef}
      data-draggable
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`absolute cursor-move transition-all ${
        isSelected ? "ring-2 ring-primary shadow-xl" : "hover:shadow-lg"
      }`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden relative group">
        {!imageError ? (
          <img
            src={item.url || "/placeholder.svg"}
            alt="Canvas item"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            crossOrigin="anonymous"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
            Erro ao carregar
          </div>
        )}

        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
