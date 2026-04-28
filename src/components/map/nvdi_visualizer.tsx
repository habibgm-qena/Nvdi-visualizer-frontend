'use client';

import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useLocation } from '@/hooks/location_context';
import { isWithinBounds } from '@/utils/validateLatLong';

import CreditScoreDrawer from '../scoringSheet/scoringSheet';
import ColorScaleRuler from './colorRuler';
import { ChevronLeft, ChevronRight, Info, Leaf, MapPin, PanelRightOpen, Sparkles } from 'lucide-react';

const VectorMap = dynamic(() => import('./VectorMap'), { ssr: false });

type MapItem = { title: string; url: string };

const maps: MapItem[] = [
    { title: '2017', url: 'https://nvdi-index-mtiles.onrender.com/data/2017/{z}/{x}/{y}.pbf' },
    { title: '2018', url: 'https://nvdi-index-mtiles.onrender.com/data/2018/{z}/{x}/{y}.pbf' },
    { title: '2019', url: 'https://nvdi-index-mtiles.onrender.com/data/2019/{z}/{x}/{y}.pbf' },
    { title: '2020', url: 'https://nvdi-index-mtiles.onrender.com/data/2020/{z}/{x}/{y}.pbf' },
    { title: '2021', url: 'https://nvdi-index-mtiles.onrender.com/data/2021/{z}/{x}/{y}.pbf' },
    { title: '2022', url: 'https://nvdi-index-mtiles.onrender.com/data/2022/{z}/{x}/{y}.pbf' },
    { title: '2023', url: 'https://nvdi-index-mtiles.onrender.com/data/2023/{z}/{x}/{y}.pbf' }
];

function YearTimeline({
    maps,
    selectedIndex,
    onChange
}: {
    maps: MapItem[];
    selectedIndex: number;
    onChange: (index: number) => void;
}) {
    const min = 0;
    const max = maps.length - 1;
    const canPrev = selectedIndex > min;
    const canNext = selectedIndex < max;

    return (
        <div className='w-full'>
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-[10px] font-semibold tracking-[0.18em] text-emerald-700/80 uppercase dark:text-emerald-300/80'>
                        Year
                    </p>
                    <p className='text-2xl leading-none font-semibold text-zinc-800 tabular-nums dark:text-zinc-100'>
                        {maps[selectedIndex].title}
                    </p>
                </div>
                <div className='flex items-center gap-1'>
                    <button
                        type='button'
                        aria-label='Previous year'
                        onClick={() => canPrev && onChange(selectedIndex - 1)}
                        disabled={!canPrev}
                        className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
                        <ChevronLeft className='h-4 w-4' />
                    </button>
                    <button
                        type='button'
                        aria-label='Next year'
                        onClick={() => canNext && onChange(selectedIndex + 1)}
                        disabled={!canNext}
                        className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
                        <ChevronRight className='h-4 w-4' />
                    </button>
                </div>
            </div>

            <div className='mt-3'>
                <Slider
                    value={[selectedIndex]}
                    max={max}
                    step={1}
                    onValueChange={(values) => onChange(values[0])}
                    className='[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-emerald-100 dark:[&_[data-slot=slider-track]]:bg-emerald-900/40'
                />
                <div className='mt-2 flex justify-between'>
                    {maps.map((m, i) => {
                        const isActive = i === selectedIndex;

                        return (
                            <button
                                type='button'
                                key={m.title}
                                onClick={() => onChange(i)}
                                className={
                                    'text-[10px] font-medium tabular-nums transition ' +
                                    (isActive
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300')
                                }>
                                {m.title.slice(2)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function MapGrid() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { lat, lng } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [hintDismissed, setHintDismissed] = useState(false);

    useEffect(() => {
        if (lat && lng && isWithinBounds(lat, lng)) {
            setIsOpen(true);
            setHintDismissed(true);
        }
    }, [lat, lng]);

    const showHint = !hintDismissed && !(lat && lng);

    return (
        <div className='relative h-screen w-screen overflow-hidden bg-zinc-100'>
            <div className='h-full w-full'>
                <VectorMap url={maps[selectedIndex].url} />
            </div>

            {/* Branded header / year picker */}
            <div className='pointer-events-none absolute top-4 left-4 z-1000 flex w-[320px] max-w-[88vw] flex-col gap-3'>
                <div className='pointer-events-auto rounded-2xl border border-white/40 bg-white/85 p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80'>
                    <div className='mb-3 flex items-center gap-2.5'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30'>
                            <Leaf className='h-5 w-5' />
                        </div>
                        <div>
                            <p className='text-sm leading-tight font-semibold text-zinc-800 dark:text-zinc-100'>
                                NDVI Explorer
                            </p>
                            <p className='text-[11px] leading-tight text-zinc-500 dark:text-zinc-400'>
                                Ethiopia · Vegetation health
                            </p>
                        </div>
                    </div>
                    <YearTimeline maps={maps} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
                </div>
            </div>

            {/* Top-right control cluster */}
            <div className='absolute top-4 right-4 z-1000 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/85 p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80'>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            title='About NDVI'
                            className='h-9 w-9 rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'>
                            <Info className='h-4.5 w-4.5' />
                            <span className='sr-only'>NDVI Information</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='z-1000 sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle className='flex items-center gap-2'>
                                <Sparkles className='h-4 w-4 text-emerald-600' />
                                What is NDVI?
                            </DialogTitle>
                            <DialogDescription>
                                The Normalized Difference Vegetation Index measures plant greenness from satellite
                                imagery. Values run from <span className='font-medium'>-1</span> (water / bare) to{' '}
                                <span className='font-medium'>+1</span> (dense, healthy vegetation).
                            </DialogDescription>
                        </DialogHeader>
                        <div className='mt-2'>
                            <ColorScaleRuler variant='inline' />
                        </div>
                        <p className='mt-2 text-xs text-zinc-500'>
                            Tip: click anywhere on the map to see crop & fertilizer recommendations for that
                            location.
                        </p>
                    </DialogContent>
                </Dialog>

                <div className='h-5 w-px bg-zinc-200 dark:bg-zinc-700' />

                <Button
                    variant='ghost'
                    onClick={() => setIsOpen(true)}
                    className='h-9 gap-1.5 rounded-full px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'>
                    <PanelRightOpen className='h-4 w-4' />
                    Insights
                </Button>

                <CreditScoreDrawer isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)} />
            </div>

            {/* Persistent legend */}
            <div className='absolute bottom-6 left-4 z-1000'>
                <ColorScaleRuler variant='panel' />
            </div>

            {/* Coach mark */}
            {showHint && (
                <div className='pointer-events-auto absolute bottom-6 left-1/2 z-1000 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-500'>
                    <div className='flex items-center gap-2 rounded-full border border-white/40 bg-zinc-900/85 px-4 py-2 text-xs text-white shadow-lg backdrop-blur-md'>
                        <MapPin className='h-3.5 w-3.5 text-emerald-300' />
                        <span>Click a point on the map to get insights</span>
                        <button
                            type='button'
                            aria-label='Dismiss hint'
                            onClick={() => setHintDismissed(true)}
                            className='ml-1 rounded-full px-1.5 py-0.5 text-[11px] text-zinc-300 hover:bg-white/10 hover:text-white'>
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
