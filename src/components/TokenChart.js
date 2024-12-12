// src/CryptoMarketChart.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TokenChart = ({ chartData }) => {
  return (
    <div>
      <div className="pt-6 w-full h-[400px] text-white">
        <Line 
          data={chartData} 
          backgroundColor="rgba(0, 0, 0, 0.1)"
        />
      </div>
    </div>
  );
};

export default TokenChart;
