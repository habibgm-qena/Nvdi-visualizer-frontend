'use client';

import { useEffect, useRef, useState } from 'react';

import { agriRecommend } from '@/app/api/endpoints/creditScoring/creditScoring';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useLocation } from '@/hooks/location_context';
import { useGenericMethod } from '@/hooks/useGenericMethod';
import { Recommendations, getAgroRecommendations } from '@/lib/agro';
import { isWithinBounds } from '@/utils/validateLatLong';

import AreaChartComponent from '../charts/areaChart';
import RecommendationsDisplay from '../recommendations/recommendation';
import './scoringSheet.scss';
import { Activity, MapPin } from 'lucide-react';

/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

interface CreditScoreDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const initialRecDetails = {
    crops: [],
    fertilizers: []
};

const CreditScoreDrawer: React.FC<CreditScoreDrawerProps> = ({ isOpen, onOpenChange }) => {
    const sheetContentRef = useRef<HTMLDivElement>(null!);
    const sheetTitleRef = useRef<HTMLDivElement>(null!);
    const [rCrops, setrCrops] = useState<any>([]);
    const [rFertilizers, setrFertilizers] = useState<any>([]);
    const [nvdiScoresdata, setNvdiScoresdata] = useState<any>(null);
    const [nvdi75Scoredata, setNvdi75Scoredata] = useState<any>(null);
    const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    const [loading, setLoading] = useState<boolean>(true);
    const { lat, lng } = useLocation();
    const [recDetails, setRecDetails] = useState<Recommendations | undefined>(initialRecDetails);
    const [location, setLocation] = useState<{ zone: string; woreda: string; kebele: string; region: string } | null>(
        null
    );

    const nvdiScores = useGenericMethod({
        method: 'GET',
        apiMethod: agriRecommend,
        skipWithOutParams: true,
        onSuccess: (data) => {
            setrFertilizers(data.recommended_fertilizers);
            setrCrops(data.recommended_crops);
            setNvdiScoresdata(
                data.ndvi_score_per_location.avg_ndvi.map((item: any, index: number) => ({
                    year: years[index],
                    score: item
                }))
            );
            setNvdi75Scoredata(
                data.ndvi_score_per_location.p75_ndvi.map((item: any, index: number) => ({
                    year: years[index],
                    score: item
                }))
            );
            setLocation({
                zone: data.ndvi_score_per_location.zone,
                woreda: data.ndvi_score_per_location.wereda,
                kebele: data.ndvi_score_per_location.kebele,
                region: data.ndvi_score_per_location.region
            });
            setRecDetails(undefined);
            getAgroRecommendations(data.recommended_crops, data.recommended_fertilizers)
                .then((recommendations) => {
                    setRecDetails(recommendations);
                })
                .catch((error) => {
                    console.error('Error in getAgroRecommendations:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        onError: (error) => {
            setLoading(false);
            console.error('Error fetching data:', error);
        }
    });

    useEffect(() => {
        if (lat && lng && isWithinBounds(lat, lng)) {
            setNvdiScoresdata(null);
            setrCrops([]);
            setrFertilizers([]);
            setRecDetails(initialRecDetails);
            setLocation(null);
            nvdiScores.reset();
            nvdiScores.handleAction({
                crop_location: { latitude: lat, longitude: lng }
            });
        }
    }, [lat, lng]);

    const locationLabel = location
        ? [location.kebele, location.woreda, location.zone, location.region].filter(Boolean).join(' · ')
        : null;

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side='right'
                className='nvdi-sheet z-10000 flex w-full max-w-md flex-col gap-0 overflow-hidden bg-gradient-to-b from-white via-white to-emerald-50/40 p-0 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/20'
                ref={sheetContentRef}>
                <SheetHeader className='border-b border-zinc-200/70 bg-white/70 px-5 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70'>
                    <SheetTitle ref={sheetTitleRef} asChild>
                        <div>
                            <div className='flex items-center gap-2'>
                                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'>
                                    <Activity className='h-4 w-4' />
                                </div>
                                <div>
                                    <p className='text-sm leading-tight font-semibold text-zinc-800 dark:text-zinc-100'>
                                        NDVI Score Progress
                                    </p>
                                    <p className='text-[11px] leading-tight text-zinc-500 dark:text-zinc-400'>
                                        Last 8 years · average & 75th percentile
                                    </p>
                                </div>
                            </div>

                            {locationLabel && (
                                <div className='mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'>
                                    <MapPin className='h-3 w-3 shrink-0' />
                                    <span className='truncate'>{locationLabel}</span>
                                </div>
                            )}
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className='nvdi-sheet-scroll flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4'>
                    <div className='rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
                        <p className='mb-1 px-1 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400'>
                            NDVI trend
                        </p>
                        <div className='h-56 w-full'>
                            <AreaChartComponent nvdiScoresdata={nvdiScoresdata} nvdi75Scoredata={nvdi75Scoredata} />
                        </div>
                    </div>

                    <RecommendationsDisplay
                        recommendations={recDetails}
                        cropRecommendation={rCrops}
                        fertilizerRecommendation={rFertilizers}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CreditScoreDrawer;
