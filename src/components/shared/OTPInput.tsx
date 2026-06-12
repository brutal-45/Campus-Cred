'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [length, autoFocus]);

  // Auto-focus first empty box
  useEffect(() => {
    const firstEmpty = value.length < length ? value.length : length - 1;
    if (autoFocus && !disabled) {
      inputRefs.current[firstEmpty]?.focus();
    }
  }, [value, length, autoFocus, disabled]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow digits
      const digits = inputValue.replace(/\D/g, '');
      if (digits.length === 0) return;

      const newValue = value.split('');
      // Take only the last digit typed (handles paste with multiple digits)
      const digit = digits[digits.length - 1];
      newValue[index] = digit;

      const result = newValue.join('').slice(0, length);
      onChange(result);

      // Move to next input
      if (index < length - 1 && digit) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if complete
      if (result.length === length && onComplete) {
        onComplete(result);
      }
    },
    [value, length, onChange, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const newValue = value.split('');
        if (newValue[index]) {
          // Clear current box
          newValue[index] = '';
          onChange(newValue.join(''));
        } else if (index > 0) {
          // Move to previous box and clear it
          newValue[index - 1] = '';
          onChange(newValue.join(''));
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    },
    [value, length, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (pastedData.length > 0) {
        const newValue = pastedData.padEnd(value.length, value.slice(pastedData.length));
        onChange(newValue.slice(0, length));

        // Focus the next empty box or the last box
        const nextFocus = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextFocus]?.focus();

        if (pastedData.length === length && onComplete) {
          onComplete(pastedData);
        }
      }
    },
    [value, length, onChange, onComplete]
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    // Select the digit for easy replacement
    inputRefs.current[index]?.select();
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, index) => {
        const digit = value[index] || '';
        const isFocused = focusedIndex === index;
        const isFilled = digit !== '';

        return (
          <div
            key={index}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              disabled={disabled}
              className={`
                w-11 h-14 sm:w-13 sm:h-16 rounded-xl text-center text-xl sm:text-2xl font-bold font-mono
                transition-all duration-200 outline-none
                ${
                  error
                    ? 'bg-red-500/10 border-2 border-red-400/60 text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                    : isFocused
                      ? 'bg-white/10 border-2 border-electric text-white focus:ring-2 focus:ring-electric/30 shadow-lg shadow-electric/10'
                      : isFilled
                        ? 'bg-white/8 border-2 border-electric/40 text-white'
                        : 'bg-white/5 border-2 border-white/15 text-white placeholder:text-white/20'
                }
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-text'}
              `}
              aria-label={`OTP digit ${index + 1}`}
            />
          </div>
        );
      })}
    </div>
  );
}
