'use client';

import React, { use, useEffect, useState } from 'react';

import { scoreChartScore } from '@/app/api/endpoints/creditScoring/creditScoring';
import { useGenericMethod } from '@/hooks/useGenericMethod';

import { Loader } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DataPoint {
    year: string;
    score: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
    }>;
}

interface CustomAxisTickProps {
    x?: number;
    y?: number;
    payload?: {
        value: string;
    };
}

interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: DataPoint;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        const avg = payload[0]?.value;
        const p75 = payload[1]?.value;

        return (
            <div className='rounded-lg border border-zinc-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95'>
                <div className='flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200'>
                    <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
                    <span>Average</span>
                    <span className='ml-auto font-semibold tabular-nums'>{avg?.toFixed?.(3) ?? avg}</span>
                </div>
                {p75 != null && (
                    <div className='mt-1 flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200'>
                        <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
                        <span>75th pct</span>
                        <span className='ml-auto font-semibold tabular-nums'>{p75?.toFixed?.(3) ?? p75}</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomAxisTick: React.FC<CustomAxisTickProps> = ({ x = 0, y = 0, payload }) => (
    <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor='middle' fill='#6B7280' className='text-xs'>
            {payload?.value}
        </text>
    </g>
);

const CustomDot: React.FC<CustomDotProps> = ({ cx, cy, payload }) => {
    if (payload?.year === '2024') {
        return <circle cx={cx} cy={cy} r={4} fill='#FFF' stroke='#000' strokeWidth={2} />;
    }
    return null;
};

const AreaChartComponent: React.FC<{ nvdiScoresdata: any; nvdi75Scoredata: any }> = ({
    nvdiScoresdata,
    nvdi75Scoredata
}) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<DataPoint[]>([]);
    const [ymax, setYmax] = useState(1);
    const [ymin, setYmin] = useState(-1);
    const [nvdiScores, setNvdiScores] = useState([]);

    // const nvdiScores = useGenericMethod({
    //     method: 'GET',
    //     apiMethod: scoreChartScore,
    //     skipWithOutParams: true,
    //     onSuccess: (data) => {
    //         console.log('Data fetched successfully:', data);
    //         const formattedData = data.map((item: any) => ({
    //             year: item.year,
    //             score: item.score
    //         }));
    //         setChartData(formattedData);
    //         setYmax(Math.max(...formattedData.map((item: any) => item.score)) + 0.2);
    //         setYmin(Math.min(...formattedData.map((item: any) => item.score)) - 0.2);
    //         setLoading(false);
    //     },
    //     onError: (error) => {
    //         setLoading(false);
    //         console.error('Error fetching data:', error);
    //     }
    // });

    // useEffect(() => {
    //     if (lat && lng) {
    //         nvdiScores.handleAction({
    //             lat: lat,
    //             lng: lng
    //         });
    //     }
    // }, [lat, lng]);

    useEffect(() => {
        console.log('nvdiScoresdata', nvdiScoresdata);
        if (nvdiScoresdata) {
            // setNvdiScores(nvdiScoresdata);
            const formattedData = nvdiScoresdata.map((item: any, index: number) => ({
                year: item.year,
                score: item.score,
                score75: nvdi75Scoredata[index]?.score || 0
            }));
            setChartData(formattedData);
            setYmax(Math.max(...nvdiScoresdata.map((item: any) => item.score)) + 2);
            setYmin(Math.min(...nvdiScoresdata.map((item: any) => item.score)) - 2);
            setLoading(false);
        }
    }, [nvdiScoresdata]);

    if (loading) {
        return (
            <div className='flex h-full w-full items-center justify-center'>
                <Loader className='h-6 w-6 animate-spin text-emerald-500' />
            </div>
        );
    }

    return (
        <div className='h-full w-full'>
            <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData} margin={{ top: 10, right: -20, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id='ndviAvg' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='0%' stopColor='#10b981' stopOpacity={0.35} />
                            <stop offset='100%' stopColor='#10b981' stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id='ndviP75' x1='0' y1='0' x2='0' y2='1'>
                            <stop offset='0%' stopColor='#f59e0b' stopOpacity={0.18} />
                            <stop offset='100%' stopColor='#f59e0b' stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#E5E7EB' opacity={0.6} />
                    <XAxis dataKey='year' axisLine={false} tickLine={false} tick={<CustomAxisTick />} interval={0} />
                    <YAxis
                        yAxisId='right'
                        orientation='right'
                        domain={[ymin, ymax]}
                        axisLine={false}
                        tickLine={false}
                        tickCount={8}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#10b981', strokeDasharray: '3 3', strokeWidth: 1 }}
                    />
                    <Area
                        type='monotone'
                        dataKey='score'
                        stroke='#10b981'
                        strokeWidth={2}
                        fill='url(#ndviAvg)'
                        dot={<CustomDot />}
                        yAxisId='right'
                        baseValue={ymin}
                        animationEasing='ease-out'
                    />
                    <Area
                        type='monotone'
                        dataKey='score75'
                        stroke='#f59e0b'
                        strokeWidth={2}
                        fill='url(#ndviP75)'
                        dot={<CustomDot />}
                        yAxisId='right'
                        baseValue={ymin}
                        animationEasing='ease-out'
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChartComponent;
