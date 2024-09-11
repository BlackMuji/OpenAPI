import React, { useState, useEffect } from 'react';
import crops from '../data/crops';  // 작물 데이터
import regions from '../data/regions';  // 지역 데이터
import coordinates from '../data/region_point.json';  // 좌표 데이터

import '../scss/weatherform.scss';

function WeatherForm({ onSelectRegion = () => {} }) {
    const [selectedCrop, setSelectedCrop] = useState(Object.keys(crops)[0]);  // 선택된 작물
    const [selectedRegion, setSelectedRegion] = useState('');  // 선택된 지역
    const [filteredRegions, setFilteredRegions] = useState([]);  // 선택된 작물에 맞는 필터링된 지역

    // 작물에 맞는 지역 필터링
    useEffect(() => {
        const cropRegions = regions.filter(region => region.crop === selectedCrop);  // 선택된 작물에 맞는 지역 필터링
        setFilteredRegions(cropRegions);  // 필터링된 지역 목록 설정

        if (cropRegions.length > 0) {
            setSelectedRegion(cropRegions[0].id);  // 첫 번째 지역 선택
        } else {
            setSelectedRegion('');  // 필터링된 지역이 없으면 선택 초기화
        }
    }, [selectedCrop]);  // 선택된 작물이 변경될 때마다 실행

    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);  // 선택된 지역 설정
    };

    const handleButtonClick = () => {
        const region = regions.find(region => region.id === selectedRegion);
        if (region) {
          const coordKey = Object.keys(coordinates).find(key => key.includes(region.name));
          const coord = coordKey ? coordinates[coordKey] : null;
      
          if (coord) {
            console.log('Selected Coordinates:', { lat: parseFloat(coord.lat), lng: parseFloat(coord.long) });
            if (typeof onSelectRegion === 'function') {
              onSelectRegion({ lat: parseFloat(coord.lat), lng: parseFloat(coord.long) });
            } else {
              console.error('onSelectRegion is not a function');
            }
          } else {
            console.error('Coordinates not found for:', region.name);
          }
        }
      };
      

    return (
        <div className='Weather_form'>
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
            <button onClick={handleButtonClick}>좌표 전송</button>
        </div>
    );
}

export default WeatherForm;
