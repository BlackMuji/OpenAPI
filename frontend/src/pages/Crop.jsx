import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData } from '../API/fetchData';
import WeatherForm from '../components/WeatherForm';
import WeatherList from '../components/WeatherList';
import Pagination from '../components/Pagination';

function Crop() {
  const [pageNo, setPageNo] = useState(1);
  const [numOfRows] = useState(12);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0); 
  const [queryParams, setQueryParams] = useState({});

  const fetchData = useCallback(async () => {
    const { ST_YM, ED_YM, regionId, cropId } = queryParams;  
    
    console.log("Request Parameters:", { ST_YM, ED_YM, regionId, cropId });  

    try {
      setLoading(true);
      const data = await fetchWeatherData(pageNo, numOfRows, ST_YM, ED_YM, regionId, cropId);  
      setWeatherData(data.items);
      setTotalCount(data.totalCount);
      setError(null);  
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`데이터를 가져오는 중 문제가 발생했습니다: ${err.message}`);  
    } finally {
      setLoading(false);
    }
  }, [pageNo, numOfRows, queryParams]);

  // 페이지 번호 또는 쿼리 파라미터가 변경될 때 데이터를 다시 요청
  useEffect(() => {
    if (queryParams.ST_YM) {
      fetchData();
    }
  }, [fetchData, queryParams, pageNo]);

  // 페이지 번호 초기화 함수
  const resetPageNo = () => {
    setPageNo(1);
  };

  return (
    <div>
      <h1>농업 기상 데이터</h1>
      <WeatherForm onSubmit={setQueryParams} resetPageNo={resetPageNo} />
      {loading && <p>데이터를 불러오는 중입니다...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && <WeatherList weatherData={weatherData} />}
      <Pagination pageNo={pageNo} setPageNo={setPageNo} totalCount={totalCount} numOfRows={numOfRows} />
    </div>
  );
}

export default Crop;
