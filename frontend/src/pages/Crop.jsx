import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData } from '../API/fetchData';
import WeatherForm from '../components/WeatherForm';
import WeatherList from '../components/WeatherList';
import Soil from './Soildata.jsx';
import Rand from './Rand.jsx';
import Modal from 'react-modal';
import { Geocode } from '../data/Geocode';  // Geocode를 불러옴

Modal.setAppElement('#root');

function Crop({ setRegion }) {
  const [pageNo, setPageNo] = useState(1);
  const [numOfRows] = useState(12);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [queryParams, setQueryParams] = useState({});
  const [modalOpenFor, setModalOpenFor] = useState(null); // 현재 어떤 차트 모달이 열렸는지 추적
  const [selectedWeatherData, setSelectedWeatherData] = useState(null); // 선택된 차트의 데이터

  // Geocode에서 regionId와 앞 5자리가 같은 항목을 찾음
  const matchingRegions = Geocode.filter((item) => {
    return queryParams.regionId && item.code && (item.type === "H") && String(item.code).startsWith(queryParams.regionId.substring(0, 5));
  });

  const fetchData = useCallback(async () => {
    const { ST_YM, ED_YM, regionId, cropId } = queryParams;

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

  const fetchChartDataForRegion = useCallback(async (ch_regionId) => {
    try {
      setLoading(true);
      const data = await fetchWeatherData(pageNo, numOfRows, queryParams.ST_YM, queryParams.ED_YM, queryParams.regionId, queryParams.cropId);
      setSelectedWeatherData(data.items || []); // 선택된 지역의 데이터를 저장
      setError(null);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError(`차트 데이터를 가져오는 중 문제가 발생했습니다: ${err.message}`);
      setSelectedWeatherData([]);  // 오류 발생 시 데이터 초기화
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

  const openModal = (regionId) => {
    setModalOpenFor(regionId);  // 현재 어떤 차트 모달이 열렸는지 설정
    fetchChartDataForRegion(regionId); // 해당 지역의 데이터를 불러옴
  };

  const closeModal = () => {
    setModalOpenFor(null);  // 모달 닫기
    setSelectedWeatherData(null);  // 선택된 차트 데이터 초기화
  };

  return (
    <div>
      <h1>농업 기상 데이터</h1>
      <WeatherForm onSubmit={setQueryParams} resetPageNo={resetPageNo} />
      {loading && <p>데이터를 불러오는 중입니다...</p>}
      {error && <p>{error}</p>}
      {/* 필터링된 Geocode 정보 출력 */}
      {matchingRegions.length > 0 ? (
        <div>
          <h3>해당 지역 정보:</h3>
          <ul>
            {matchingRegions.map((item, index) => (
              <li key={index}>
                {item.city} {item.county} {item.districts}

                {!loading && !error && weatherData.length > 0 && (
                  <>
                    <button onClick={() => openModal(item.code)} disabled={loading}>차트 보기</button>
                    <Modal
                      isOpen={modalOpenFor === item.code}  // 해당 지역의 모달이 열려 있는지 확인
                      onRequestClose={closeModal}
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
                      <h2>{item.city} {item.county} 기상 차트</h2>
                      <button onClick={closeModal}>닫기</button>
                      {/* 선택된 차트의 데이터만 표시 */}
                      {selectedWeatherData && <WeatherList weatherData={selectedWeatherData} />}
                      <Soil pnuCode={Number(item.code)} />
                      <Rand pnuCode={Number(item.code)} />
                    </Modal>
                    <button onClick={() => setRegion({ lat: parseFloat(item.lat), lng: parseFloat(item.long) })}> 이동</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>해당하는 지역 정보를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}

export default Crop;
