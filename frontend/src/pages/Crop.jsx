import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData } from '../API/fetchData';
import WeatherForm from '../components/WeatherForm';
import WeatherList from '../components/WeatherList';
import Modal from 'react-modal';

Modal.setAppElement('#root');  // React Modal의 접근성 설정

function Crop() {
  const [pageNo, setPageNo] = useState(1);
  const [numOfRows] = useState(12);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [queryParams, setQueryParams] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const { ST_YM, ED_YM, regionId, cropId } = queryParams;

    console.log("Request Parameters:", { ST_YM, ED_YM, regionId, cropId });

    try {
      setLoading(true);
      const data = await fetchWeatherData(pageNo, numOfRows, ST_YM, ED_YM, regionId, cropId);
      setWeatherData(data.items || []);
      setTotalCount(data.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`데이터를 가져오는 중 문제가 발생했습니다: ${err.message}`);
      setWeatherData([]);  // 오류가 발생하면 데이터를 비워줍니다.
    } finally {
      setLoading(false);
    }
  }, [pageNo, numOfRows, queryParams]);

  useEffect(() => {
    if (queryParams.ST_YM) {
      fetchData();
    }
  }, [fetchData, queryParams, pageNo]);

  const resetPageNo = () => {
    setPageNo(1);
  };

  return (
    <div>
      <h1>농업 기상 데이터</h1>
      <WeatherForm onSubmit={setQueryParams} resetPageNo={resetPageNo} />
      {loading && <p>데이터를 불러오는 중입니다...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && weatherData.length > 0 && (
        <>
          <button onClick={() => setIsModalOpen(true)} disabled={loading}>차트 보기</button>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Weather Data Charts"
            ariaHideApp={false}
            style={{
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                padding: '20px'
              }
            }}
          >
            <h2>기상 데이터 차트</h2>
            <button onClick={() => setIsModalOpen(false)}>닫기</button>
            <WeatherList weatherData={weatherData} />
          </Modal>
        </>
      )}
    </div>
  );
}

export default Crop;
