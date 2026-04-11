import { useEffect, useRef } from "react";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, parseISO } from "date-fns";

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend, Filler);

function riskColor(score) {
  if (score >= 0.7) return "#ef4444";
  if (score >= 0.3) return "#f59e0b";
  return "#22c55e";
}

export default function RiskScoreTimeline({ scores = [] }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sorted  = [...scores].reverse();
    const labels  = sorted.map((s) => {
      try { return format(parseISO(s.recorded_at), "MMM d HH:mm"); }
      catch { return s.recorded_at; }
    });
    const data    = sorted.map((s) => +(s.score * 100).toFixed(2));
    const colors  = sorted.map((s) => riskColor(s.score));

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Risk Score (%)",
            data,
            borderColor: "#6c63ff",
            backgroundColor: "rgba(108,99,255,0.12)",
            pointBackgroundColor: colors,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
          },
          {
            label: "High Risk Threshold",
            data: Array(labels.length).fill(70),
            borderColor: "rgba(239,68,68,0.45)",
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#94a3b8", font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y.toFixed(1)}%`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", maxRotation: 45, font: { size: 11 } },
            grid:  { color: "#2a2d3e" },
          },
          y: {
            min: 0, max: 100,
            ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
            grid:  { color: "#2a2d3e" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [scores]);

  if (!scores.length) {
    return (
      <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 40 }}>
        No risk score data available.
      </div>
    );
  }

  return <div style={{ height: 280 }}><canvas ref={canvasRef} /></div>;
}