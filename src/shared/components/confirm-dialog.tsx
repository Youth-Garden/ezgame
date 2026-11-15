'use client';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Icons } from '@/shared/icons';
import { type PortalProps } from '@/shared/types/portal.types';

export interface ConfirmDialogData {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  icon3D?: 'leave-match-3d' | 'victory-3d' | 'defeat-3d' | 'draw-3d';
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<ConfirmDialogData>) {
  if (!isOpen || !data) return null;

  const {
    title,
    description,
    confirmText = 'Confirm',
    cancelText,
    variant = 'destructive',
    icon3D = 'leave-match-3d',
    showCloseButton = true,
    onConfirm,
    onCancel,
  } = data;

  const handleConfirm = () => {
    onDismiss?.();
    onConfirm?.();
  };

  const handleCancel = () => {
    onDismiss?.();
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent
        showCloseButton={showCloseButton}
        className="sm:max-w-sm flex flex-col items-center gap-4 text-center"
      >
        {/* 3D Illustrated Badge (No flat background box) */}
        <div className="transform hover:scale-105 transition-transform duration-200 mt-1">
          <Icons name={icon3D} size={72} />
        </div>

        <DialogHeader className="items-center text-center">
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary mt-1.5 max-w-[280px] leading-relaxed font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-2">
          {cancelText && (
            <Button
              variant="secondary"
              size="default"
              onClick={handleCancel}
              className="w-full text-xs font-semibold"
            >
              {cancelText}
            </Button>
          )}

          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            size="default"
            onClick={handleConfirm}
            className="w-full text-xs font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
