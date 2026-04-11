import { useEffect, useRef, useState } from "react";
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { getPHQHistory } from "../api/apiClient";

Chart.register(
  LineElement, PointElement, LineController,
  BarElement, BarController,
  CategoryScale, LinearScale,
  Tooltip, Legend
);

const PHQ_SEVERITY_LINES = [
  { y: 5,  label: "Mild",              color: "rgba(34,197,94,0.4)" },
  { y: 10, label: "Moderate",          color: "rgba(245,158,11,0.4)" },
  { y: 15, label: "Mod. Severe",       color: "rgba(239,68,68,0.35)" },
  { y: 20, label: "Severe",            color: "rgba(185,28,28,0.5)" },
];

export default function PHQ9Comparison({ userId, riskScores = [] }) {
  const canvasRef  = useRef(null);
  const chartRef   = useRef(null);
  const [phqData, setPhqData]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userId) return;
    getPHQHistory(userId, 10)
      .then((r) => setPhqData(r.data))
      .catch(() => setPhqData([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (loading || !canvasRef.current) return;

    // Build shared timeline from PHQ dates
    const phqSorted = [...phqData].reverse();
    const labels    = phqSorted.map((p) => {
      try { return format(parseISO(p.submitted_at), "MMM d"); }
      catch { return p.submitted_at; }
    });

    // Match risk scores to PHQ dates (nearest reading per PHQ date)
    const riskByDate = {};
    riskScores.forEach(({ score, recorded_at }) => {
      try {
        const day = format(parseISO(recorded_at), "MMM d");
        if (!riskByDate[day] || score > riskByDate[day]) {
          riskByDate[day] = score;
        }
      } catch { /* skip */ }
    });

    const riskAligned = labels.map((l) =>
      riskByDate[l] != null ? +(riskByDate[l] * 100).toFixed(2) : null
    );

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      data: {
        labels,
        datasets: [
          {
            type: "bar",
            label: "PHQ-9 Score",
            data: phqSorted.map((p) => p.score),
            backgroundColor: phqSorted.map((p) =>
              p.score >= 20 ? "rgba(185,28,28,0.7)"  :
              p.score >= 15 ? "rgba(239,68,68,0.6)"  :
              p.score >= 10 ? "rgba(245,158,11,0.6)" :
                              "rgba(34,197,94,0.6)"
            ),
            borderRadius: 4,
            yAxisID: "yPHQ",
          },
          {
            type: "line",
            label: "Risk Score (%)",
            data: riskAligned,
            borderColor: "#6c63ff",
            backgroundColor: "rgba(108,99,255,0.08)",
            pointRadius: 5,
            pointBackgroundColor: "#6c63ff",
            tension: 0.4,
            fill: false,
            yAxisID: "yRisk",
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: "#94a3b8", font: { size: 11 } } },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const phqVal = items.find((i) => i.dataset.label === "PHQ-9 Score");
                if (!phqVal) return "";
                const score = phqVal.parsed.y;
                const sev =
                  score >= 20 ? "Severe" :
                  score >= 15 ? "Moderately Severe" :
                  score >= 10 ? "Moderate" :
                  score >= 5  ? "Mild" : "Minimal";
                return `Severity: ${sev}`;
              },
            },
          },
        },
        scales: {
          yPHQ: {
            type: "linear",
            position: "left",
            min: 0, max: 27,
            ticks: { color: "#94a3b8", stepSize: 5 },
            grid:  { color: "#2a2d3e" },
            title: { display: true, text: "PHQ-9", color: "#94a3b8", font: { size: 11 } },
          },
          yRisk: {
            type: "linear",
            position: "right",
            min: 0, max: 100,
            ticks: { color: "#6c63ff", callback: (v) => `${v}%` },
            grid:  { drawOnChartArea: false },
            title: { display: true, text: "Risk %", color: "#6c63ff", font: { size: 11 } },
          },
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid:  { color: "#2a2d3e" },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [phqData, riskScores, loading]);

  if (loading) {
    return <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 32 }}>Loading PHQ data…</div>;
  }

  if (!phqData.length) {
    return <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 32 }}>No PHQ-9 assessments recorded.</div>;
  }

  // Severity reference legend
  return (
    <div>
      <div style={{ height: 240 }}>
        <canvas ref={canvasRef} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        {PHQ_SEVERITY_LINES.map((l) => (
          <span key={l.label} style={{
            fontSize: 10,
            color: "var(--color-muted)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            padding: "2px 6px",
          }}>
            ≥{l.y} {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}