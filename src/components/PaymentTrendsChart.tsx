import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PaymentTransaction, SemesterFeeSchedule } from '../types';
import { TrendingUp, Calendar, CheckCircle2, Clock, Info, ShieldCheck } from 'lucide-react';

interface PaymentTrendsChartProps {
  transactions: PaymentTransaction[];
  currentSchedule?: SemesterFeeSchedule;
  academicYear?: string;
}

interface TrendPoint {
  date: Date;
  dateStr: string;
  amount: number;
  cumulative: number;
  receiptNo: string;
  method: string;
  bank: string;
  status: string;
}

export const PaymentTrendsChart: React.FC<PaymentTrendsChartProps> = ({
  transactions,
  currentSchedule,
  academicYear = '2024-2025',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<TrendPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter only verified transactions and sort chronologically
  const verifiedTx = transactions
    .filter((t) => t.status === 'VERIFIED')
    .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

  // Aggregate cumulative totals
  let runningTotal = 0;
  const trendData: TrendPoint[] = verifiedTx.map((t) => {
    runningTotal += t.amountPaid;
    return {
      date: new Date(t.paymentDate),
      dateStr: new Date(t.paymentDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: t.amountPaid,
      cumulative: runningTotal,
      receiptNo: t.receiptNo,
      method: t.paymentMethod.replace('ONLINE_', '').replace('OFFLINE_', ''),
      bank: t.bankName || 'Bank Portal',
      status: t.status,
    };
  });

  const totalFeeTarget = currentSchedule?.totalAmount || 68500;
  const currentTotalPaid = runningTotal;
  const percentComplete = Math.min(100, Math.round((currentTotalPaid / totalFeeTarget) * 100));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous D3 render
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const margin = { top: 30, right: 35, bottom: 45, left: 65 };
    const width = containerWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom);

    // Defs for gradients & shadow filters
    const defs = svg.append('defs');

    // Area gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.4);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.0);

    // Target line dash filter / glow
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // If no transactions yet, show empty state message
    if (trendData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '13px')
        .text('No verified payment history recorded for this academic year yet.');
      return;
    }

    // Determine domain dates
    const startDate = new Date(Math.min(...trendData.map((d) => d.date.getTime())));
    // Backtrack slightly for padding
    const domainStart = new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const domainEnd = new Date(Math.max(...trendData.map((d) => d.date.getTime()), Date.now() + 7 * 24 * 60 * 60 * 1000));

    // Scales
    const xScale = d3.scaleTime().domain([domainStart, domainEnd]).range([0, width]);

    const maxVal = Math.max(totalFeeTarget, ...trendData.map((d) => d.cumulative)) * 1.15;
    const yScale = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);

    // Grid lines
    const yGrid = d3.axisLeft(yScale).tickSize(-width).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-opacity', 0.5);

    // Target threshold line (Total semester fee demand)
    const targetY = yScale(totalFeeTarget);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', targetY)
      .attr('y2', targetY)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.85);

    g.append('text')
      .attr('x', width - 8)
      .attr('y', targetY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#10b981')
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', '600')
      .text(`Semester Fee Target: ${formatCurrency(totalFeeTarget)}`);

    // Area Generator
    const area = d3
      .area<TrendPoint>()
      .x((d) => xScale(d.date))
      .y0(height)
      .y1((d) => yScale(d.cumulative))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const line = d3
      .line<TrendPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.cumulative))
      .curve(d3.curveMonotoneX);

    // Extend data to starting zero point for smooth area curve
    const extendedData: TrendPoint[] = [
      {
        date: domainStart,
        dateStr: 'Term Start',
        amount: 0,
        cumulative: 0,
        receiptNo: '',
        method: '',
        bank: '',
        status: '',
      },
      ...trendData,
    ];

    // Render Area
    g.append('path')
      .datum(extendedData)
      .attr('fill', 'url(#d3-area-grad)')
      .attr('d', area);

    // Render Line
    const path = g
      .append('path')
      .datum(extendedData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Path transition animation
    const pathEl = path.node();
    if (pathEl) {
      const length = pathEl.getTotalLength();
      path
        .attr('stroke-dasharray', `${length} ${length}`)
        .attr('stroke-dashoffset', length)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Render interactive data points
    trendData.forEach((point) => {
      const cx = xScale(point.date);
      const cy = yScale(point.cumulative);

      // Outer glow circle
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 7)
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.25)
        .attr('class', 'animate-pulse');

      // Inner solid point
      const dot = g
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 4.5)
        .attr('fill', '#60a5fa')
        .attr('stroke', '#1e293b')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      // Individual installment label above dot
      g.append('text')
        .attr('x', cx)
        .attr('y', cy - 11)
        .attr('text-anchor', 'middle')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'ui-monospace, monospace')
        .text(`+${formatCurrency(point.amount)}`);

      // Mouse events for interactive tooltips
      dot.on('mouseenter', (event) => {
        dot.transition().duration(150).attr('r', 6).attr('fill', '#38bdf8');
        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x: mouseX, y: mouseY });
        setActiveTooltip(point);
      });

      dot.on('mouseleave', () => {
        dot.transition().duration(150).attr('r', 4.5).attr('fill', '#60a5fa');
        setActiveTooltip(null);
      });
    });

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => `₹${Number(d) >= 1000 ? `${Number(d) / 1000}k` : d}`);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

    // Remove axis spine lines for modern clean appearance
    g.selectAll('.domain').attr('stroke', '#475569');
  }, [transactions, currentSchedule, totalFeeTarget]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl relative"
    >
      {/* Header with summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-3 border-b border-slate-700/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">
              Academic Year Payment Trend & Clearance
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              D3.js Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cumulative remittance trajectory across Academic Year {academicYear}.
          </p>
        </div>

        {/* Milestone Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Cleared to Date
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {formatCurrency(currentTotalPaid)} / {formatCurrency(totalFeeTarget)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-700/70 border border-slate-600 flex flex-col items-center justify-center">
            <span className="text-xs font-bold font-mono text-blue-300">{percentComplete}%</span>
            <span className="text-[8px] text-slate-400">cleared</span>
          </div>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ minHeight: '260px' }} />

        {/* Floating Custom HTML Tooltip */}
        {activeTooltip && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-blue-500/50 shadow-2xl rounded-xl p-3 text-xs text-white -translate-x-1/2 -translate-y-full mb-3 backdrop-blur-md min-w-[200px]"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-mono text-[10px] text-blue-400 font-bold">
                {activeTooltip.receiptNo}
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">
                VERIFIED
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Installment:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(activeTooltip.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cumulative:</span>
                <span className="font-mono text-slate-200">
                  {formatCurrency(activeTooltip.cumulative)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid Via:</span>
                <span className="text-slate-300 font-medium">
                  {activeTooltip.method} ({activeTooltip.bank})
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>Date:</span>
                <span>{activeTooltip.dateStr}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Explanatory Footer */}
      <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block"></span>
            <span>Cumulative Cleared Dues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-emerald-400 inline-block"></span>
            <span>Tariff Benchmark Threshold</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-time D3 reconciliation with Accounts Ledger</span>
        </div>
      </div>
    </div>
  );
};
