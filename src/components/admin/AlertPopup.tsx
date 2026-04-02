'use client';

import React from 'react';
import { Icons } from '@/components/Icon';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertPopupProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  badgeText?: string;
  badgeColor?: string;
  primaryAction?: () => void;
  primaryActionText?: string;
  secondaryAction?: () => void;
  secondaryActionText?: string;
  onClose: () => void;
}

const alertConfig: Record<AlertType, { icon: React.ReactNode; iconColor: string; bgColor: string }> = {
  success: { icon: <Icons.Check className="text-3xl" />, iconColor: 'text-green-500', bgColor: 'bg-green-500/10' },
  error: { icon: <Icons.Delete className="text-3xl" />, iconColor: 'text-red-500', bgColor: 'bg-red-500/10' },
  warning: { icon: <Icons.Warning className="text-3xl" />, iconColor: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  info: { icon: <Icons.Info className="text-3xl" />, iconColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
};

export default function AlertPopup({
  isOpen,
  type,
  title,
  message,
  badgeText,
  badgeColor,
  primaryAction,
  primaryActionText = 'CONTINUE',
  secondaryAction,
  secondaryActionText,
  onClose,
}: AlertPopupProps) {
  if (!isOpen) return null;

  const config = alertConfig[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-surface-container-low border border-outline-variant/15 p-8 max-w-lg w-full overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 ${config.bgColor} flex items-center justify-center ${config.iconColor}`}>
              {config.icon}
            </div>
            <h2 className="text-xl font-headline font-extrabold text-white tracking-tight uppercase">{title}</h2>
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-on-surface-variant font-body leading-relaxed">{message}</p>

            {badgeText && badgeColor && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}>
                {badgeText}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {primaryAction && (
              <button
                onClick={() => {
                  primaryAction();
                  onClose();
                }}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-xs uppercase tracking-widest px-8 py-3 active:scale-95 transition-all"
              >
                {primaryActionText}
              </button>
            )}

            {secondaryAction && (
              <button
                onClick={() => {
                  secondaryAction();
                  onClose();
                }}
                className="bg-surface-container-highest text-white font-headline font-bold text-xs uppercase tracking-widest px-8 py-3 hover:bg-surface-bright transition-colors border border-outline-variant/20"
              >
                {secondaryActionText}
              </button>
            )}

            {!primaryAction && !secondaryAction && (
              <button
                onClick={onClose}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-xs uppercase tracking-widest px-8 py-3 active:scale-95 transition-all"
              >
                ACKNOWLEDGE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
