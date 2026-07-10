import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  singleButton?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes, Continue",
  cancelText = "No, Cancel",
  isDestructive = true,
  singleButton = false
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-surface-container-lowest rounded-[2rem] shadow-2xl border border-outline-variant overflow-hidden"
          >
            <div className="p-8 space-y-6 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm",
                isDestructive ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
              )}>
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-headline text-2xl text-on-surface">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95",
                    isDestructive 
                      ? "bg-error text-white hover:bg-error/90 shadow-error/10" 
                      : "bg-primary text-on-primary hover:bg-primary/90 shadow-primary/10"
                  )}
                >
                  {confirmText}
                </button>
                {!singleButton && (
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl font-bold text-sm text-on-surface-variant hover:bg-surface-variant/20 transition-all border border-outline-variant"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-on-surface-variant/40 hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
