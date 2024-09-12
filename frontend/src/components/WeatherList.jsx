import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function WeatherList({ weatherData }) {
  if (!Array.isArray(weatherData) || weatherData.length === 0) {
    return <p>데이터가 없습니다. 차트를 표시할 수 없습니다.</p>;
  }

  const processMonthlyData = (data) => {
    const monthlyData = Array.from({ length: 12 }, () => ({
      count: 0,
      totalTemp: 0,
      totalRhm: 0,
      totalRain: 0
    }));

    data.forEach(item => {
      const month = parseInt(item.ym.substr(4, 2), 10); // 'mm' 형식으로 월 추출
      const temp = parseFloat(item.mnhAvgTa) || 0;
      const rhm = parseFloat(item.mnhAvgRhm) || 0;
      const rain = parseFloat(item.mnhSumRn) || 0;

      monthlyData[month - 1].count += 1;
      monthlyData[month - 1].totalTemp += temp;
      monthlyData[month - 1].totalRhm += rhm;
      monthlyData[month - 1].totalRain += rain;
    });

    const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    const avgTempData = monthlyData.map(({ count, totalTemp }) => totalTemp / count);
    const avgRhmData = monthlyData.map(({ count, totalRhm }) => totalRhm / count);
    const sumRainData = monthlyData.map(({ count, totalRain }) => totalRain / count);

    return { labels, avgTempData, avgRhmData, sumRainData };
  };

  const { labels, avgTempData, avgRhmData, sumRainData } = processMonthlyData(weatherData);

  const tempData = {
    labels: labels,
    datasets: [
      {
        label: '평균 온도 (°C)',
        data: avgTempData,
        borderColor: 'rgba(255, 99, 132, 1)',  // 빨강색
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
      },
    ],
  };

  const rhmData = {
    labels: labels,
    datasets: [
      {
        label: '상대 습도 (%)',
        data: avgRhmData,
        borderColor: 'rgba(75, 192, 192, 1)',  // 초록색
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  const rainData = {
    labels: labels,
    datasets: [
      {
        label: '강수량 (mm)',
        data: sumRainData,
        borderColor: 'rgba(54, 162, 235, 1)',  // 푸른색
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '연간 월별 기상 데이터 시각화',
      },
    },
  };

  return (
    <div>
      <div style={{ width: '50%', height: '30%', marginBottom: '30px' }}>
        <Line data={tempData} options={chartOptions} />
      </div>
      <div style={{ width: '50%', height: '30%', marginBottom: '30px' }}>
        <Line data={rhmData} options={chartOptions} />
      </div>
      <div style={{ width: '50%', height: '30%' }}>
        <Line data={rainData} options={chartOptions} />
      </div>
    </div>
  );
}

export default WeatherList;
