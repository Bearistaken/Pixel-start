import React from 'react';

export interface WidgetToggleProps {
    id: string;
    label: string;
    isActive: boolean;
    onToggle: (id: string) => void;
}

export const WidgetToggle: React.FC<WidgetToggleProps> = ({ id, label, isActive, onToggle }) => (
    <div
        onClick={() => onToggle(id)}
        className="flex items-center justify-between border border-[var(--color-border)] p-3 cursor-pointer hover:bg-[var(--color-hover)] select-none group no-radius"
    >
        <span className="text-[var(--color-fg)]">{label}</span>
        <span className="font-mono text-[var(--color-accent)] font-bold group-hover:text-shadow-glow">
            {isActive ? '[x]' : '[ ]'}
        </span>
    </div>
);
