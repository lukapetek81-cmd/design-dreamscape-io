import { useEffect, useRef } from 'react';

interface UseKeyboardShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
}

export const useKeyboardShortcut = (
  key: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {}
) => {
  const {
    preventDefault = true,
    stopPropagation = true,
    enabled = true,
  } = options;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const keys = Array.isArray(key) ? key : [key];
      const pressedKey = event.key.toLowerCase();
      
      const modifierPressed = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
      
      if (keys.some(k => k.toLowerCase() === pressedKey)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        
        callbackRef.current(event);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [key, preventDefault, stopPropagation, enabled]);
};

export const useEscapeKey = (callback: () => void, enabled = true) => {
  useKeyboardShortcut('Escape', callback, { enabled });
};

export const useArrowNavigation = (
  onUp: () => void,
  onDown: () => void,
  onLeft?: () => void,
  onRight?: () => void,
  enabled = true
) => {
  useKeyboardShortcut('ArrowUp', onUp, { enabled });
  useKeyboardShortcut('ArrowDown', onDown, { enabled });
  if (onLeft) useKeyboardShortcut('ArrowLeft', onLeft, { enabled });
  if (onRight) useKeyboardShortcut('ArrowRight', onRight, { enabled });
};