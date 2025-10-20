import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const EEGChart = () => {
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const windowSize = 50;
  const intervalRef = useRef(null);

  // Load CSV
  useEffect(() => {
    const csvPath = process.env.PUBLIC_URL + "/eeg-data.csv";

    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        const formattedData = result.data
          .filter((row) => row.timestamp && row.value)
          .map((row) => {
            const timestamp = new Date(row.timestamp);
            const timeLabel = !isNaN(timestamp)
              ? timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : row.timestamp;

            return {
              timeLabel,
              value: parseFloat(row.value),
            };
          })
          .filter((item) => !isNaN(item.value));

        setData(formattedData);
      },
      error: (err) => console.error("Error loading CSV:", err),
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (data.length === 0) return;
    let index = 0;

    function startInterval() {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setDisplayData((prev) => {
            const newData = [...prev, data[index]];
            if (newData.length > windowSize) newData.shift();
            return newData;
          });
          index++;
          if (index >= data.length) clearInterval(intervalRef.current);
        }
      }, 300); // speed of animation (slower = larger number)
    }

    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [data, isPaused]);

  // Pause/Resume button handler
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div style={{ width: "100%", height: 450, padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>EEG Visualizer</h2>

      {/* Pause / Resume button */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button
          onClick={togglePause}
          style={{
            backgroundColor: isPaused ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isPaused ? "Resume ▶️" : "Pause ⏸️"}
        </button>
      </div>

      {displayData.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "100px" }}>
          ⚠️ Loading data...
        </p>
      ) : (
        <ResponsiveContainer>
          <LineChart
            data={displayData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timeLabel"
              label={{
                value: "Time (HH:MM)",
                position: "insideBottomRight",
                offset: -5,
              }}
              tick={{ fontSize: 12 }}
              minTickGap={20}
            />
            <YAxis
              label={{
                value: "EEG Value",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              dot={false}
              name="EEG Signal"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EEGChart;
