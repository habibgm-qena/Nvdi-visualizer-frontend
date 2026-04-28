'use client';

import React from 'react';

type Variant = 'panel' | 'inline';

interface Props {
    variant?: Variant;
}

// NDVI gradient stops chosen to read like satellite-style vegetation maps:
// water/bare → soil → sparse → moderate → healthy.
const GRADIENT =
    'linear-gradient(to right, #2b6cb0 0%, #c2410c 18%, #b45309 32%, #a16207 46%, #84cc16 64%, #16a34a 82%, #064e3b 100%)';

const STOPS: Array<{ value: string; label: string }> = [
    { value: '-1', label: 'Water' },
    { value: '-0.2', label: 'Bare' },
    { value: '0.2', label: 'Sparse' },
    { value: '0.5', label: 'Moderate' },
    { value: '1', label: 'Dense' }
];

export default function ColorScaleRuler({ variant = 'inline' }: Props) {
    const isPanel = variant === 'panel';

    return (
        <div
            className={
                isPanel
                    ? 'pointer-events-auto w-72 rounded-2xl border border-white/40 bg-white/85 p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80'
                    : 'w-full'
            }>
            {isPanel && (
                <div className='mb-2 flex items-baseline justify-between'>
                    <p className='text-[11px] font-semibold tracking-wider text-zinc-700 uppercase dark:text-zinc-200'>
                        Vegetation Index
                    </p>
                    <span className='text-[10px] font-medium text-zinc-500 dark:text-zinc-400'>NDVI</span>
                </div>
            )}

            <div
                className='h-2.5 w-full rounded-full ring-1 ring-black/5 dark:ring-white/10'
                style={{ background: GRADIENT }}
            />

            <div className='mt-2 flex justify-between'>
                {STOPS.map((s) => (
                    <div key={s.value} className='flex flex-col items-center'>
                        <span className='text-[10px] font-medium text-zinc-500 dark:text-zinc-400'>{s.value}</span>
                        <span className='text-[10px] font-semibold text-zinc-700 dark:text-zinc-200'>{s.label}</span>
                    </div>
                ))}
            </div>

            {isPanel && (
                <p className='mt-3 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400'>
                    Higher NDVI indicates healthier, denser vegetation. Click the map to inspect a location.
                </p>
            )}
        </div>
    );
}
