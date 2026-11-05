import React from "react";

export interface PortalProps<T = unknown> {
  id?: string;
  isOpen?: boolean;
  onDismiss?: () => void;
  data?: T;
}

export interface PortalInstance<T = unknown> extends PortalProps<T> {
  component: React.ComponentType<PortalProps<T>>;
  disableCloseByBackdrop?: boolean;
  disableBackdrop?: boolean;
}
