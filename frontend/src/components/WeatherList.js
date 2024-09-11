import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function WeatherList({ weatherData }) {
  if (!Array.isArray(weatherData)) {
    return <p>잘못된 데이터 형식입니다.</p>;
  }

  const labels = [];
  const avgTempData = [];
  const avgRhmData = [];
  const sumRnData = [];

  let previousYM = null;
  const filteredData = weatherData.filter(item => {
    const isDuplicate = item.ym === previousYM;
    previousYM = item.ym;
    return !isDuplicate;
  });

  filteredData.slice(0, 12).forEach((item) => {
    labels.push(item.ym);
    avgTempData.push(parseFloat(item.mnhAvgTa));
    avgRhmData.push(parseFloat(item.mnhAvgRhm));
    sumRnData.push(parseFloat(item.mnhSumRn));
  });

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
        data: sumRnData,
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
        text: '기상 데이터 시각화',
      },
    },
  };

  return (
    <div>
      {/* 리스트 데이터를 출력 */}
      <div>
        {filteredData.length === 0 ? (
          <p>데이터가 없습니다.</p>
        ) : (
          filteredData.slice(0, 12).map((item, index) => (
            <div key={index}>
              <strong>지역:</strong> {item.areaName}, 
              <strong> 날짜:</strong> {item.ym},
              <strong> 평균 온도:</strong> {item.mnhAvgTa}℃,
              <strong> 상대 습도:</strong> {item.mnhAvgRhm}%,
              <strong> 최고 기온:</strong> {item.mnhMaxTa}℃,
              <strong> 강수량:</strong> {item.mnhSumRn}mm,
              <strong> 작물:</strong> {item.paCropName},
              <strong> 계절:</strong> {item.paCropSpeName}
            </div>
          ))
        )}
      </div>

      {/* 평균 온도 차트 */}
      <div style={{ width: '800px', height: '400px', marginBottom: '30px' }}>
        <Line data={tempData} options={chartOptions} />
      </div>

      {/* 상대 습도 차트 */}
      <div style={{ width: '800px', height: '400px', marginBottom: '30px' }}>
        <Line data={rhmData} options={chartOptions} />
      </div>

      {/* 강수량 차트 */}
      <div style={{ width: '800px', height: '400px' }}>
        <Line data={rainData} options={chartOptions} />
      </div>
    </div>
  );
}

export default WeatherList;
