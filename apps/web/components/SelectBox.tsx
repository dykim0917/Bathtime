'use client';

import { CaretDown, Check } from '@phosphor-icons/react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import styles from './SelectBox.module.css';

export type SelectBoxOption<Value extends string = string> = {
  value: Value;
  label: string;
};

type SelectBoxProps<Value extends string> = {
  value: Value;
  options: SelectBoxOption<Value>[];
  ariaLabel: string;
  onChange: (value: Value) => void;
  label?: string;
  leadingIcon?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function SelectBox<Value extends string>({
  value,
  options,
  ariaLabel,
  onChange,
  label,
  leadingIcon,
  compact = false,
  className,
}: SelectBoxProps<Value>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + direction + options.length) % options.length);
      return;
    }

    if (!open) return;
    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`${styles.root}${className ? ` ${className}` : ''}`} data-compact={compact ? 'true' : undefined}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {leadingIcon ? <span className={styles.leadingIcon}>{leadingIcon}</span> : null}
        {label ? <span className={styles.label}>{label}</span> : null}
        <span className={styles.value}>{selectedOption?.label ?? value}</span>
        <CaretDown className={styles.caret} size={15} weight="bold" aria-hidden="true" />
      </button>

      {open ? (
        <div id={listboxId} className={styles.menu} role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button
              id={`${listboxId}-option-${index}`}
              key={option.value}
              className={styles.option}
              type="button"
              role="option"
              aria-selected={option.value === value}
              data-active={index === activeIndex ? 'true' : undefined}
              onClick={() => selectOption(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{option.label}</span>
              <Check size={15} weight="bold" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
