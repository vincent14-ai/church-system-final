import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirm",
  showFooter = true,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2">{children}</div>

        {showFooter && (
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[90px]"
            >
              Cancel
            </Button>
            {onConfirm && (
              <Button onClick={onConfirm} className="min-w-[90px]">
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
