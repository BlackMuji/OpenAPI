import React, { useEffect, useState } from 'react';
import { SOIL_API_KEY } from '../data/Config';  // API 키를 가져옴
import xml2js from 'xml2js';  // XML을 JSON으로 변환하는 라이브러리

// 법정동 코드를 매개변수로 받는 컴포넌트 정의
function Soil({ pnuCode }) {
    const [soilData, setSoilData] = useState([]);  // 토양 데이터 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지 상태
    const itemsPerPage = 10;  // 한 페이지당 최대 10개의 데이터 표시

    // 컴포넌트가 마운트되거나 pnuCode가 변경될 때 실행되는 useEffect 훅
    useEffect(() => {
        const fetchData = async () => {
            const endpoint = `http://apis.data.go.kr/1390802/SoilEnviron/SoilExam/getSoilExamList?serviceKey=${SOIL_API_KEY}&Page_Size=100&Page_No=1&BJD_Code=${pnuCode}`;

            try {
                // API 호출
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const responseText = await response.text();

                // XML 데이터를 JSON으로 변환
                xml2js.parseString(responseText, { explicitArray: false }, (err, result) => {
                    if (err) {
                        throw new Error(`Error parsing XML: ${err.message}`);
                    } else {
                        // XML 파싱 결과에서 items를 안전하게 접근
                        const items = result?.response?.body?.items?.item || [];  // items가 undefined일 경우 빈 배열로 처리
                        console.log('Parsed items:', items);
                        setSoilData(Array.isArray(items) ? items : [items]);  // 데이터 설정
                    }
                });
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error.message);  // 에러 설정
            } finally {
                setLoading(false);  // 로딩 상태 해제
            }
        };

        fetchData();
    }, [pnuCode]);

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 테이블 렌더링 함수
    const renderTable = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const selectedData = soilData.slice(startIndex, startIndex + itemsPerPage);  // 현재 페이지에 해당하는 데이터 선택

        return (
            <table border="1">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>법정동 코드</th>
                        <th>지번 주소</th>
                        <th>시료채취년도</th>
                        <th>토양 검정일</th>
                        <th>경지 구분</th>
                        <th>산도</th>
                        <th>유효 인산</th>
                        <th>유효 규산</th>
                        <th>유기물</th>
                        <th>마그네슘</th>
                        <th>칼륨</th>
                        <th>칼슘</th>
                        <th>전기전도도</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedData.length > 0 ? (
                        selectedData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.No}</td>
                                <td>{item.BJD_Code}</td>
                                <td>{item.PNU_Nm}</td>
                                <td>{item.Any_Year}</td>
                                <td>{item.Exam_Day}</td>
                                <td>{item.Exam_Type}</td>
                                <td>{item.ACID}</td>
                                <td>{item.VLDPHA}</td>
                                <td>{item.VLDSIA}</td>
                                <td>{item.OM}</td>
                                <td>{item.POSIFERT_MG}</td>
                                <td>{item.POSIFERT_K}</td>
                                <td>{item.POSIFERT_CA}</td>
                                <td>{item.SELC}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="14">No data available</td></tr>
                    )}
                </tbody>
            </table>
        );
    };

    // 로딩 상태일 때 보여줄 컴포넌트
    if (loading) {
        return <div><p>Loading...</p></div>;
    }

    // 에러 상태일 때 보여줄 컴포넌트
    if (error) {
        return <div><p>Error: {error}</p></div>;
    }

    // 메인 컴포넌트 렌더링
    return (
        <div>
            {soilData.length > 0 ? (
                <>
                    {renderTable()}  {/* 데이터가 있을 때 테이블 렌더링*/}
                    <div>
                        {Array.from({ length: Math.ceil(soilData.length / itemsPerPage) }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                disabled={currentPage === index + 1}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <p>No data available</p>  // 데이터가 없을 때 표시
            )}
        </div>
    );
}

export default Soil;  // 컴포넌트 내보내기
