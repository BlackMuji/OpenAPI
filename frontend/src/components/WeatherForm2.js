import React, { useState, useEffect } from 'react';
import crops from '../data/crops';
import regions from '../data/regions';

function WeatherForm({ onSubmit, resetPageNo }) {
  const [ST_YM, setST_YM] = useState('201601');
  const [ED_YM, setED_YM] = useState('202312');
  const [selectedCrop, setSelectedCrop] = useState(Object.keys(crops)[0]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [filteredRegions, setFilteredRegions] = useState([]);

  // 작물에 맞는 지역 필터링
  useEffect(() => {
    const cropRegions = regions.filter(region => region.crop === selectedCrop);
    setFilteredRegions(cropRegions);

    if (cropRegions.length > 0) {
      setSelectedRegion(cropRegions[0].id);  // 첫 번째 지역 선택
    } else {
      setSelectedRegion('');  // 필터링된 지역이 없을 경우 초기화
    }
  }, [selectedCrop]);

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    resetPageNo(); // 지역 선택시 페이지 번호를 1로 초기화
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ST_YM,
      ED_YM,
      regionId: selectedRegion,
      cropId: crops[selectedCrop]
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        시작 연월 (YYYYMM):
        <input type="text" value={ST_YM} onChange={(e) => setST_YM(e.target.value)} required />
      </label>
      <br />
      <label>
        종료 연월 (YYYYMM):
        <input type="text" value={ED_YM} onChange={(e) => setED_YM(e.target.value)} required />
      </label>
      <br />
      <label>
        작물:
        <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
          {Object.keys(crops).map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        지역:
        <select value={selectedRegion} onChange={handleRegionChange}>
          {filteredRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button type="submit">데이터 가져오기</button>
    </form>
  );
}

export default WeatherForm;
