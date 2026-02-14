import React, { useRef } from 'react';

interface AsciiSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    displayValue?: string;
    onChange: (value: number) => void;
    hint?: string;
}

export const AsciiSlider: React.FC<AsciiSliderProps> = ({ label, value, min, max, step = 1, displayValue, onChange, hint }) => {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const sliderRef = useRef<HTMLDivElement>(null);

    const computeValue = (clientX: number) => {
        const track = sliderRef.current?.querySelector('[data-track]') as HTMLDivElement;
        if (!track) return value;
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        const raw = min + pct * (max - min);
        const snapped = Math.round(raw / step) * step;
        return Math.max(min, Math.min(max, snapped));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        onChange(computeValue(e.clientX));

        const handleMouseMove = (ev: MouseEvent) => {
            onChange(computeValue(ev.clientX));
        };
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const dir = e.deltaY < 0 ? 1 : -1;
        const newVal = Math.max(min, Math.min(max, value + dir * step));
        onChange(newVal);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        let newVal = value;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            newVal = Math.min(max, value + step);
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            newVal = Math.max(min, value - step);
            e.preventDefault();
        }
        if (newVal !== value) onChange(newVal);
    };

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-fg)]">{label}</span>
                <span className="text-[var(--color-accent)] font-mono">{displayValue ?? value}</span>
            </div>
            <div
                ref={sliderRef}
                className="flex items-center gap-0 cursor-pointer select-none outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-sm"
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="slider"
                aria-label={label}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={displayValue ?? String(value)}
                title={`${label}: ${displayValue ?? value}`}
            >
                <span className="text-[var(--color-muted)] font-mono text-xs leading-none">[</span>
                <div data-track className="flex-1 h-[6px] bg-[var(--color-border)] relative overflow-hidden" style={{ borderRadius: '1px' }}>
                    <div
                        className="h-full bg-[var(--color-accent)] transition-[width] duration-75"
                        style={{ width: `${ratio * 100}%` }}
                    />
                </div>
                <span className="text-[var(--color-muted)] font-mono text-xs leading-none">]</span>
            </div>
            {hint && <div className="text-[10px] text-[var(--color-muted)] mt-1">{hint}</div>}
        </div>
    );
};
