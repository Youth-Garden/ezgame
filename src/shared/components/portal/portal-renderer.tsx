"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePortalStore } from "@/shared/store/portal.store";
import type { PortalInstance } from "@/shared/types/portal.types";
import { Backdrop } from "./backdrop";

const emptySubscribe = () => () => {};

export const PortalRenderer = () => {
  const { portals, onDismiss } = usePortalStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || portals.length === 0) return null;

  return createPortal(
    <>
      {portals.map((instance) => (
        <PortalInstanceItem
          key={instance.id}
          instance={instance}
          onDismiss={() => onDismiss(instance.id)}
        />
      ))}
    </>,
    document.body
  );
};

const PortalInstanceItem = ({
  instance,
  onDismiss,
}: {
  instance: PortalInstance;
  onDismiss: () => void;
}) => {
  const Component = instance.component;

  if (instance.disableBackdrop) {
    return (
      <Component
        id={instance.id}
        data={instance.data}
        isOpen={instance.isOpen}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto w-full h-full flex items-center justify-center">
        <Backdrop
          isOpen={instance.isOpen}
          onPress={() => {
            if (!instance.disableCloseByBackdrop) {
              onDismiss();
            }
          }}
        />
        <Component
          id={instance.id}
          data={instance.data}
          isOpen={instance.isOpen}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
};
