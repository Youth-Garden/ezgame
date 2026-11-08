"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePortalStore } from "@/shared/store/portal.store";
import { Backdrop } from "./backdrop";

const emptySubscribe = () => () => {};

export const PortalRenderer = () => {
  const { portals, onDismiss } = usePortalStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Close top-most portal when Escape is pressed
  useEffect(() => {
    if (!isClient || portals.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const topOpenPortal = [...portals].reverse().find((p) => p.isOpen);
        if (topOpenPortal && !topOpenPortal.disableCloseByBackdrop) {
          onDismiss(topOpenPortal.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClient, portals, onDismiss]);

  if (!isClient || portals.length === 0) return null;

  // Global backdrop: active if any portal without disableBackdrop is currently open
  const activeBackdropPortal = portals.find(
    (portal) => !portal.disableBackdrop && portal.isOpen
  );
  const isAnyBackdropOpen = Boolean(activeBackdropPortal);

  // When clicking backdrop, dismiss the top-most dismissable portal
  const handleBackdropPress = () => {
    const topPortal = [...portals].reverse().find((p) => !p.disableBackdrop && p.isOpen);
    if (topPortal && !topPortal.disableCloseByBackdrop) {
      onDismiss(topPortal.id);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Single centralized backdrop configured in 1 place for all portals */}
      <Backdrop
        isOpen={isAnyBackdropOpen}
        onPress={handleBackdropPress}
      />

      {/* Render all modal/dialog component instances on top of backdrop */}
      {portals.map((instance) => {
        const Component = instance.component;
        return (
          <div
            key={instance.id}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md flex justify-center">
              <Component
                id={instance.id}
                data={instance.data}
                isOpen={instance.isOpen}
                onDismiss={() => onDismiss(instance.id)}
              />
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
