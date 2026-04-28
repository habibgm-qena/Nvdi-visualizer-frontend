import React, { useEffect, useState } from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import '../scoringSheet/scoringSheet.scss';
import { ChevronDown, ChevronRight, FlaskConical, Leaf, Loader, Sparkles, Wheat } from 'lucide-react';

export interface CropRecommendation {
    crop: string;
    summary: string;
    detailed: string;
    icon: string;
}

export interface FertilizerRecommendation {
    fertilizer: string;
    composition: string;
    recommendation: string;
    alignment: string;
}

export interface Recommendations {
    crops: CropRecommendation[];
    fertilizers: FertilizerRecommendation[];
}

interface RecommendationsDisplayProps {
    recommendations?: Recommendations;
    cropRecommendation?: string[];
    fertilizerRecommendation?: string[];
    // maxHeight?: string; // Allow customizable height
}

export const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({
    recommendations,
    cropRecommendation,
    fertilizerRecommendation
    // maxHeight = 'calc(100vh - 400px)' // Default reasonable height that leaves space for headers/footers
}) => {
    const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [consultingGenAi, setConsultingGenAi] = useState<boolean>(false);

    useEffect(() => {
        if (recommendations) {
            setLoading(false);
        } else if (cropRecommendation && fertilizerRecommendation) {
            setConsultingGenAi(true);
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [recommendations, cropRecommendation, fertilizerRecommendation]);

    const toggleCropDetails = (index: number) => {
        setExpandedCrops((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const CropsRecRender: React.FC<{ crop: CropRecommendation; index: number; isloading?: boolean }> = ({
        crop,
        index,
        isloading = false
    }) => {
        return (
            <Card
                key={index}
                className='border-0 bg-white shadow-sm transition-all duration-200 hover:shadow dark:bg-gray-800'>
                <div className='border-b border-gray-100 bg-white p-2 pb-3 dark:border-gray-700 dark:bg-gray-800'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'>
                                {crop.icon}
                            </div>
                            <div className='text-lg font-medium text-gray-800 dark:text-gray-100'>{crop.crop}</div>
                        </div>
                        <Badge className='flex items-center gap-1 rounded-full border-0 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300'>
                            <Sparkles className='h-3 w-3' />
                            Top Pick
                        </Badge>
                    </div>
                </div>

                <div className='px-3'>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>{crop.summary}</p>

                    {isloading && (
                        <div className='mt-3 flex items-center justify-center'>
                            <Loader className='h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-gray-900' />
                            {/* consolting gen ai */}
                            <p className='ml-2 text-sm text-gray-500 dark:text-gray-400'>Consulting GenAI...</p>
                        </div>
                    )}

                    {expandedCrops[index] && (
                        <div className='mt-3 rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-700/30'>
                            <p className='whitespace-pre-line text-gray-600 dark:text-gray-300'>{crop.detailed}</p>
                        </div>
                    )}

                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex h-auto items-center gap-1 justify-self-end p-0 pt-1 text-xs font-medium text-green-600 hover:bg-transparent hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                        onClick={() => toggleCropDetails(index)}>
                        {expandedCrops[index] ? 'Less info' : 'More info'}
                        <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedCrops[index] ? 'rotate-180' : ''}`}
                        />
                    </Button>
                </div>

                {/* <div className='flex justify-start border-t border-gray-100 p-2 pt-3 dark:border-gray-700'>
                                
                            </div> */}
            </Card>
        );
    };

    const FertilizersRecRender: React.FC<{
        fertilizer: FertilizerRecommendation;
        index: number;
        isloading?: boolean;
    }> = ({ fertilizer, index, isloading = false }) => {
        return (
            <Card
                key={index}
                className='border-0 bg-white shadow-sm transition-all duration-200 hover:shadow dark:bg-gray-800'>
                <Accordion type='single' collapsible className='w-full'>
                    <AccordionItem value={`item-${index}`} className='border-0'>
                        <CardHeader className='border-b border-gray-100 p-3 dark:border-gray-700'>
                            <AccordionTrigger className='flex w-full items-center justify-between py-0 hover:no-underline'>
                                <div className='flex items-center gap-2'>
                                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'>
                                        <FlaskConical className='h-4 w-4' />
                                    </div>
                                    <div className='text-left'>
                                        <CardTitle className='text-lg font-medium text-gray-800 dark:text-gray-100'>
                                            {fertilizer.fertilizer}
                                        </CardTitle>
                                        <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                                            {fertilizer.composition}
                                        </p>
                                        {isloading && (
                                            <div className='mt-3 flex items-center justify-center'>
                                                <Loader className='h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-gray-900' />
                                                {/* consolting gen ai */}
                                                <p className='ml-2 text-sm text-gray-500 dark:text-gray-400'>
                                                    Consulting GenAI...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* <ChevronDown className='h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400' /> */}
                            </AccordionTrigger>
                        </CardHeader>

                        <AccordionContent>
                            <CardContent className='space-y-3 p-3 pt-3'>
                                <div>
                                    <h4 className='mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400'>
                                        Recommendation
                                    </h4>
                                    <p className='text-xs text-gray-700 dark:text-gray-300'>
                                        {fertilizer.recommendation}
                                    </p>
                                </div>

                                <div>
                                    <h4 className='mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase dark:text-blue-400'>
                                        Soil Alignment
                                    </h4>
                                    <p className='text-xs text-gray-700 dark:text-gray-300'>{fertilizer.alignment}</p>
                                </div>
                            </CardContent>

                            <CardFooter className='flex justify-start border-t border-gray-100 p-2 dark:border-gray-700'>
                                <Badge className='flex items-center gap-1 rounded-full border-0 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                                    <Sparkles className='h-3 w-3' />
                                    Best Match
                                </Badge>
                            </CardFooter>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </Card>
        );
    };

    return (
        <div className='mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col'>
            <Tabs defaultValue='crops' className='flex min-h-0 w-full flex-1 flex-col'>
                <TabsList className='mb-3 grid h-10 w-full grid-cols-2 gap-1 rounded-xl border border-zinc-200/70 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
                    <TabsTrigger
                        value='crops'
                        className='rounded-lg text-sm font-medium text-zinc-500 transition-all data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-700 dark:text-zinc-400 dark:data-[state=active]:bg-emerald-500/15 dark:data-[state=active]:text-emerald-300'>
                        <div className='flex items-center gap-1.5'>
                            <Wheat className='h-4 w-4' />
                            <span>Crops</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value='fertilizers'
                        className='rounded-lg text-sm font-medium text-zinc-500 transition-all data-[state=active]:bg-sky-500/10 data-[state=active]:text-sky-700 dark:text-zinc-400 dark:data-[state=active]:bg-sky-500/15 dark:data-[state=active]:text-sky-300'>
                        <div className='flex items-center gap-1.5'>
                            <FlaskConical className='h-4 w-4' />
                            <span>Fertilizers</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* Apply custom scrollable styles directly to TabsContent */}
                {!loading && (
                    <TabsContent value='crops' className='scrollbar-hidden flex-1 space-y-3 overflow-y-auto'>
                        {recommendations &&
                            recommendations.crops.map((crop, index) => (
                                <CropsRecRender key={index} crop={crop} index={index} />
                            ))}

                        {cropRecommendation &&
                            !recommendations &&
                            cropRecommendation.map((crop, index) => (
                                <CropsRecRender
                                    key={index}
                                    crop={{ crop, summary: '', detailed: '', icon: '⏳' }}
                                    index={index}
                                    isloading={consultingGenAi}
                                />
                            ))}
                    </TabsContent>
                )}

                {!loading && (
                    <TabsContent value='fertilizers' className='scrollbar-hidden flex-1 space-y-3 overflow-y-auto'>
                        {recommendations &&
                            recommendations.fertilizers.map((fertilizer, index) => (
                                <FertilizersRecRender key={index} fertilizer={fertilizer} index={index} />
                            ))}

                        {fertilizerRecommendation &&
                            !recommendations &&
                            fertilizerRecommendation.map((fertilizer, index) => (
                                <FertilizersRecRender
                                    key={index}
                                    fertilizer={{ fertilizer, alignment: '', composition: '', recommendation: '' }}
                                    index={index}
                                    isloading={consultingGenAi}
                                />
                            ))}
                    </TabsContent>
                )}

                {loading && (
                    <div className='mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white/60 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/40'>
                        <div className='relative'>
                            <Loader className='h-8 w-8 animate-spin text-emerald-500' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-zinc-700 dark:text-zinc-200'>
                                Analyzing this location
                            </p>
                            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                                Crops and fertilizers will appear here.
                            </p>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    );
};

export default RecommendationsDisplay;
