'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook de focus trap para modales accesibles.
 * Atrapa el foco dentro del contenedor referenciado y lo restaura al cerrar.
 * Soporta tecla Escape para cerrar y devuelve el foco al elemento que lo abrió.
 */
export function useFocusTrap(
  isActive: boolean,
  onClose?: () => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Guardar el elemento que tenía el foco antes de abrir
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    // Enfocar el primer elemento focusable después de un micro-tick
    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else if (containerRef.current) {
        containerRef.current.setAttribute('tabindex', '-1');
        containerRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      // Restaurar foco al elemento anterior
      previousFocusRef.current?.focus();
    };
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape cierra el modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Tab / Shift+Tab: atrapar foco
      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: si estamos en el primero, saltar al último
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: si estamos en el último, saltar al primero
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose, getFocusableElements]);

  return containerRef;
}
