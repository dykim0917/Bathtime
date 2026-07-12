'use client';

import { Info } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { getOnsenTermInfo, type OnsenTermInfoKey } from '@web/lib/onsenTermInfo';

type TermInfoProps = {
  termKey: OnsenTermInfoKey;
  align?: 'start' | 'end';
  className?: string;
};

type TermTooltipProps = {
  title: string;
  description: string;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
};

type PopoverPosition = {
  top: number;
  left: number;
  arrowLeft: number;
  placement: 'top' | 'bottom';
  mobile: boolean;
};

const VIEWPORT_GAP = 12;
const TRIGGER_GAP = 10;

function useTermPopover<TriggerElement extends HTMLElement>(align: 'start' | 'end') {
  const triggerRef = useRef<TriggerElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    if (window.innerWidth <= 767) {
      setPosition({ top: 0, left: 0, arrowLeft: 0, placement: 'bottom', mobile: true });
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - popoverRect.width - VIEWPORT_GAP);
    const preferredLeft = align === 'end'
      ? triggerRect.right - popoverRect.width
      : triggerRect.left;
    const left = Math.min(Math.max(preferredLeft, VIEWPORT_GAP), maxLeft);
    const hasRoomBelow = triggerRect.bottom + TRIGGER_GAP + popoverRect.height <= window.innerHeight - VIEWPORT_GAP;
    const hasRoomAbove = triggerRect.top - TRIGGER_GAP - popoverRect.height >= VIEWPORT_GAP;
    const placement = hasRoomBelow || !hasRoomAbove ? 'bottom' : 'top';
    const top = placement === 'bottom'
      ? triggerRect.bottom + TRIGGER_GAP
      : triggerRect.top - TRIGGER_GAP - popoverRect.height;
    const triggerCenter = triggerRect.left + (triggerRect.width / 2);
    const arrowLeft = Math.min(Math.max(triggerCenter - left - 7, 12), popoverRect.width - 26);

    setPosition({ top, left, arrowLeft, placement, mobile: false });
  }, [align]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleViewportChange = () => updatePosition();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !triggerRef.current?.contains(event.target)) setOpen(false);
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open, updatePosition]);

  return { open, popoverRef, position, setOpen, triggerRef };
}

function TermPopover({
  id,
  title,
  description,
  open,
  popoverRef,
  position,
}: {
  id: string;
  title: string;
  description: string;
  open: boolean;
  popoverRef: React.RefObject<HTMLSpanElement | null>;
  position: PopoverPosition | null;
}) {
  if (!open || typeof document === 'undefined') return null;

  const style = position && !position.mobile
    ? {
      top: position.top,
      left: position.left,
      '--bt-term-arrow-left': `${position.arrowLeft}px`,
    } as CSSProperties
    : undefined;

  return createPortal(
    <span
      ref={popoverRef}
      id={id}
      className="bt-term-info-popover"
      data-mobile={position?.mobile ? 'true' : undefined}
      data-placement={position?.placement ?? 'bottom'}
      data-ready={position ? 'true' : 'false'}
      role="tooltip"
      style={style}
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </span>,
    document.body
  );
}

export function TermInfo({ termKey, align = 'start', className }: TermInfoProps) {
  const info = getOnsenTermInfo(termKey);
  const tooltipId = useId();
  const { open, popoverRef, position, setOpen, triggerRef } = useTermPopover<HTMLButtonElement>(align);

  return (
    <span
      className={`bt-term-info${className ? ` ${className}` : ''}`}
      data-align={align}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        className="bt-term-info-trigger"
        type="button"
        aria-label={`${info.title} 설명 보기`}
        aria-describedby={open ? tooltipId : undefined}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
      >
        <Info size={14} weight="bold" aria-hidden="true" />
      </button>
      <TermPopover
        id={tooltipId}
        title={info.title}
        description={info.description}
        open={open}
        popoverRef={popoverRef}
        position={position}
      />
    </span>
  );
}

export function TermTooltip({
  title,
  description,
  children,
  align = 'start',
  className,
}: TermTooltipProps) {
  const tooltipId = useId();
  const { open, popoverRef, position, setOpen, triggerRef } = useTermPopover<HTMLSpanElement>(align);

  return (
    <span
      ref={triggerRef}
      className={`bt-term-tooltip${className ? ` ${className}` : ''}`}
      aria-label={`${title}: ${description}`}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <TermPopover
        id={tooltipId}
        title={title}
        description={description}
        open={open}
        popoverRef={popoverRef}
        position={position}
      />
    </span>
  );
}
