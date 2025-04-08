'use client'
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface DailyData {
    date: string;
    count: number;
}

interface ApexChartProps {
    data: number[][];
    title: string;
    height: number;
}

const ApexChart = ({ data, title, height }: ApexChartProps) => {

    const [state, setState] = useState({
        series: [] as { data: number[][] }[],
        options: {
            chart: {
                id: 'area-datetime',
                type: 'area' as const,
                height: height,
                zoom: {
                    autoScaleYaxis: true
                }
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                style: 'hollow',
            },
            xaxis: {
                type: 'datetime' as const,
                min: new Date('01 Nov 2024').getTime(),
                tickAmount: 6,
            },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy'
                }
            },
            fill: {
                type: 'gradient' as const,
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.15,
                    opacityTo: 0.5,
                    stops: [0, 100]
                },
                colors: ['#FFFFFF']
            },
            title: {
                text: title,
                align: 'left' as const,
                style: {
                    color: '#FFFFFF',
                    fontSize: '20px',
                    fontWeight: 400,
                }
            },
            stroke: {
                show: true,
                curve: 'smooth' as const,
                lineCap: 'butt' as const,
                colors: undefined,
                width: 1,
                dashArray: 0, 
            },
            grid: {
                show: true,
                borderColor: '#90A4AE',
                strokeDashArray: 1,
                position: 'back' as const,
                xaxis: {
                    lines: {
                        show: false
                    }
                },   
                yaxis: {
                    lines: {
                        show: true
                    }
                },  
                row: {
                    colors: undefined,
                    opacity: 0.5
                },  
                column: {
                    colors: undefined,
                    opacity: 0.5
                },  
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },  
            }
        },

        selection: 'one_year',
    });

    useEffect(() => {
        setState({
            ...state,
            series: [{ data: data }]
        })
    }, [data])

    return (
        <div className="bg-[#0E0E10] border border-[#25252799] rounded-[12px] text-mainBg p-4 w-full">
            <div id="chart">
                <div id="chart-timeline">
                    <ReactApexChart options={state.options} series={state.series} type="area" height={height} />
                </div>
            </div>
            <div id="html-dist"></div>
        </div>
    )
}

export default ApexChart;