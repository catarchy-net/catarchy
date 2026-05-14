import React, { useEffect, useId, useRef, useState } from "react";
import SelectTriangle from "../assets/select-triangle.svg?react";
import { cn } from "../lib/cn";
import { Box } from "./box";
import styles from "./select-box.module.css";
import { Text } from "./text";

export interface SelectOption<V extends string = string> {
  value: V;
  label: React.ReactNode | ((option: { selected: boolean }) => React.ReactNode);
  disabled?: boolean;
  hidden?: boolean;
}

export interface SelectBoxProps<V extends string = string> {
  value?: V;
  defaultValue?: V;
  placeholder?: string;
  disabled?: boolean;
  options?: SelectOption<V>[];
  className?: string;
  optionContentClassName?: string;
  onChange?: (option: SelectOption<V>) => void;
  onBlur?: () => void;
}

export function SelectBox<V extends string = string>({
  value,
  defaultValue,
  placeholder,
  disabled = false,
  options = [],
  className,
  optionContentClassName,
  onChange,
  onBlur,
}: SelectBoxProps<V>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [dropLeft, setDropLeft] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const resolveLabel = (label: SelectOption["label"], selected: boolean) =>
    typeof label === "function" ? label({ selected }) : label;

  const visibleOptions = options.filter((o) => !o.hidden);
  const selectedOption = options.find((o) => o.value === currentValue);
  const displayLabel = selectedOption ? (
    resolveLabel(selectedOption.label, false)
  ) : placeholder ? (
    <Text className={styles.placeholder}>{placeholder}</Text>
  ) : null;

  function openList() {
    if (disabled) return;
    setPositioned(false);
    setActiveIndex(
      Math.max(
        0,
        visibleOptions.findIndex((o) => o.value === currentValue),
      ),
    );
    setOpen(true);
  }

  function closeList() {
    setOpen(false);
    setDropUp(false);
    onBlur?.();
  }

  function selectOption(option: SelectOption<V>) {
    if (option.disabled) return;
    if (!isControlled) setInternalValue(option.value);
    onChange?.(option);
    closeList();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openList();
        else if (visibleOptions[activeIndex])
          selectOption(visibleOptions[activeIndex]);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Escape":
      case "Tab":
        closeList();
        break;
    }
  }

  useEffect(() => {
    if (!open || !triggerWrapRef.current || !listRef.current) return;
    const triggerRect = triggerWrapRef.current.getBoundingClientRect();
    const listWidth = listRef.current.offsetWidth;
    const listHeight = listRef.current.offsetHeight;
    setDropUp(window.innerHeight - triggerRect.bottom < listHeight + 4);
    setDropLeft(window.innerWidth - triggerRect.left < listWidth);
    setPositioned(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        !triggerWrapRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        closeList();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className={cn(styles.root, className)}>
      <div ref={triggerWrapRef} className={styles.triggerWrap}>
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-activedescendant={
            open && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={() => (open ? closeList() : openList())}
          onKeyDown={handleKeyDown}
          className={cn(styles.combobox, !disabled && styles.comboboxClickable)}
        >
          <Box
            rounded
            className={styles.triggerWrapper}
            containerClassName={cn(styles.trigger, disabled && "bg-dither-3")}
          >
            <Text className={styles.triggerLabel}>{displayLabel}</Text>
            <SelectTriangle
              className={cn(
                styles.triggerIcon,
                open && styles.triggerIconOpen,
                disabled && styles.triggerIconDisabled,
              )}
            />
          </Box>
        </div>

        {open && (
          <Box
            tight
            rounded
            ref={listRef}
            id={listId}
            role="listbox"
            className={cn(
              styles.dropdown,
              !positioned && styles.dropdownInvisible,
              dropLeft ? styles.dropdownLeft : styles.dropdownRight,
              dropUp ? styles.dropdownUp : styles.dropdownDown,
              optionContentClassName,
            )}
          >
            <div className={styles.dropdownInner}>
              {visibleOptions.map((option, index) => (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.value === currentValue}
                  aria-disabled={option.disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  className={cn(
                    styles.option,
                    index === activeIndex &&
                      !option.disabled &&
                      cn(styles.optionActive, "font-stroke-white"),
                    option.disabled && styles.optionDisabled,
                  )}
                >
                  {typeof option.label === "string" ? (
                    <Text
                      as={option.disabled ? "s" : "span"}
                      className={cn(
                        option.disabled && styles.optionDisabledText,
                      )}
                    >
                      {option.label}
                    </Text>
                  ) : (
                    resolveLabel(option.label, option.value === currentValue)
                  )}
                </div>
              ))}
            </div>
          </Box>
        )}
      </div>
    </div>
  );
}
