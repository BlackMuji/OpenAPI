import React, { useState, useEffect } from 'react';
import Randvalue from '../data/Randvalue.json';

const Rand = ({ pnuCode }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log(pnuCode);
  
      // pnuCode를 문자열로 변환
      const pnuCodeStr = String(pnuCode);
  
      // pnuCode 앞 5자리는 City_num, County_num의 첫 두 글자는 pnuCode의 6~7번째 글자
      const cityNum = pnuCodeStr.slice(0, 5);    // 첫 5자리
      const countyNumFirstTwo = pnuCodeStr.slice(5, 7); // 6~7번째 글자 (County_num의 첫 두 글자)
  
      // 필터링 조건에 맞는 데이터 추출 (City_num은 정확히, County_num은 첫 두 글자만 비교)
      const filtered = Randvalue.filter(item => 
        item.City_num === cityNum && item.County_num.slice(0, 2) === countyNumFirstTwo
      );
  
      // 최대 100개로 제한
      setFilteredData(filtered.slice(0, 100));
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }, [pnuCode]);
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {filteredData.length > 0 ? (
        <ul>
          {filteredData.map(item => (
            <li key={item.Number}>
              <p>Location: {item.location}</p>
              <p>Area: {item.area}</p>
              <p>Current Use: {item.current_use}</p>
              {/* 필요에 따라 더 많은 정보를 표시할 수 있습니다 */}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No matching data found</p>
      )}
    </div>
  );
};

export default Rand;
