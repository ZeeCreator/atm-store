'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data: {
    labels: string[];
    sales: number[];
    revenue: number[];
  };
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Orders',
        data: data.sales,
        borderColor: '#FF5625',
        backgroundColor: 'rgba(255, 86, 37, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Revenue (IDR)',
        data: data.revenue,
        borderColor: '#ffb5a0',
        backgroundColor: 'rgba(255, 181, 160, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e2e1',
          font: {
            family: 'Space Grotesk',
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}

interface CategoryChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          '#FF5625',
          '#ffb5a0',
          '#ffdbd1',
          '#c2c7cf',
          '#c3c7cd',
        ],
        borderColor: '#131313',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#e5e2e1',
          font: {
            family: 'Space Grotesk',
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

interface StatsChartProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    lowStock: number;
  };
}

export function StatsChart({ stats }: StatsChartProps) {
  const data = {
    labels: ['Products', 'Orders', 'Revenue', 'Low Stock'],
    datasets: [
      {
        label: 'Overview',
        data: [
          stats.totalProducts,
          stats.totalOrders,
          stats.totalRevenue / 1000000, // Convert to millions for display
          stats.lowStock,
        ],
        backgroundColor: [
          'rgba(255, 86, 37, 0.8)',
          'rgba(255, 181, 160, 0.8)',
          'rgba(194, 199, 207, 0.8)',
          'rgba(255, 86, 37, 0.4)',
        ],
        borderColor: [
          '#FF5625',
          '#ffb5a0',
          '#c2c7cf',
          '#FF5625',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#e5e2e1',
          font: {
            family: 'Space Grotesk',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  );
}
