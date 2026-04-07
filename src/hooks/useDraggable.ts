"use client";

import { useRef, useCallback, useEffect } from "react";

interface DraggableOptions {
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number, deltaX: number, deltaY: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  disabled?: boolean;
  handle?: string; // CSS selector for drag handle
  bounds?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };
}

export const useDraggable = (options: DraggableOptions = {}) => {
  const { bounds, disabled, handle, onDrag, onDragEnd, onDragStart } = options;
  const elementRef = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !elementRef.current) return;

      e.preventDefault();

      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      let newX = currentPos.current.x + deltaX;
      let newY = currentPos.current.y + deltaY;

      // Apply bounds if specified
      if (bounds) {
        const element = elementRef.current;
        const rect = element.getBoundingClientRect();
        if (bounds.left !== undefined) {
          newX = Math.max(bounds.left, newX);
        }
        if (bounds.top !== undefined) {
          newY = Math.max(bounds.top, newY);
        }
        if (bounds.right !== undefined) {
          newX = Math.min(bounds.right - rect.width, newX);
        }
        if (bounds.bottom !== undefined) {
          newY = Math.min(bounds.bottom - rect.height, newY);
        }
      }

      // Apply position
      elementRef.current.style.left = `${newX}px`;
      elementRef.current.style.top = `${newY}px`;
      elementRef.current.style.right = "auto";
      elementRef.current.style.bottom = "auto";

      onDrag?.(newX, newY, deltaX, deltaY);
    },
    [bounds, onDrag],
  );

  const handleMouseUp = useCallback(
    (_e: MouseEvent) => {
      if (!isDragging.current || !elementRef.current) return;

      isDragging.current = false;

      // Remove global event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Restore cursor and text selection
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      // Get final position
      const rect = elementRef.current.getBoundingClientRect();
      onDragEnd?.(rect.left, rect.top);
    },
    [handleMouseMove, onDragEnd],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;

      // Check if we should handle this element
      const target = e.target as HTMLElement;
      const element = elementRef.current;
      if (!element) return;

      // If handle is specified, check if click is on handle
      if (handle) {
        const handleElement = element.querySelector(handle);
        if (!handleElement || !handleElement.contains(target)) return;
      }

      e.preventDefault();
      e.stopPropagation();

      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };

      // Get current position
      const rect = element.getBoundingClientRect();
      currentPos.current = { x: rect.left, y: rect.top };

      onDragStart?.(currentPos.current.x, currentPos.current.y);

      // Add global event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Prevent text selection
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    },
    [
      handleMouseMove,
      handleMouseUp,
      disabled,
      handle,
      onDragStart,
    ],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current || !elementRef.current || e.touches.length !== 1)
        return;

      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      let newX = currentPos.current.x + deltaX;
      let newY = currentPos.current.y + deltaY;

      // Apply bounds if specified
      if (bounds) {
        const element = elementRef.current;
        const rect = element.getBoundingClientRect();
        if (bounds.left !== undefined) {
          newX = Math.max(bounds.left, newX);
        }
        if (bounds.top !== undefined) {
          newY = Math.max(bounds.top, newY);
        }
        if (bounds.right !== undefined) {
          newX = Math.min(bounds.right - rect.width, newX);
        }
        if (bounds.bottom !== undefined) {
          newY = Math.min(bounds.bottom - rect.height, newY);
        }
      }

      // Apply position
      elementRef.current.style.left = `${newX}px`;
      elementRef.current.style.top = `${newY}px`;
      elementRef.current.style.right = "auto";
      elementRef.current.style.bottom = "auto";

      onDrag?.(newX, newY, deltaX, deltaY);
    },
    [bounds, onDrag],
  );

  const handleTouchEnd = useCallback(
    (_e: TouchEvent) => {
      if (!isDragging.current || !elementRef.current) return;

      isDragging.current = false;

      // Remove touch event listeners
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      // Get final position
      const rect = elementRef.current.getBoundingClientRect();
      onDragEnd?.(rect.left, rect.top);
    },
    [handleTouchMove, onDragEnd],
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const target = touch.target as HTMLElement;
      const element = elementRef.current;
      if (!element) return;

      // If handle is specified, check if touch is on handle
      if (handle) {
        const handleElement = element.querySelector(handle);
        if (!handleElement || !handleElement.contains(target)) return;
      }

      e.preventDefault();

      isDragging.current = true;
      startPos.current = { x: touch.clientX, y: touch.clientY };

      // Get current position
      const rect = element.getBoundingClientRect();
      currentPos.current = { x: rect.left, y: rect.top };

      onDragStart?.(currentPos.current.x, currentPos.current.y);

      // Add touch event listeners
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    },
    [
      handleTouchEnd,
      handleTouchMove,
      disabled,
      handle,
      onDragStart,
    ],
  );

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("touchstart", handleTouchStart);

      // Clean up global listeners in case component unmounts during drag
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    handleMouseDown,
    handleTouchStart,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Reset position function
  const resetPosition = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    element.style.left = "";
    element.style.top = "";
    element.style.right = "";
    element.style.bottom = "";
  }, []);

  // Set position function
  const setPosition = useCallback((x: number, y: number) => {
    const element = elementRef.current;
    if (!element) return;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
  }, []);

  return {
    ref: elementRef,
    isDragging: isDragging.current,
    resetPosition,
    setPosition,
  };
};
