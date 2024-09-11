import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import '../scss/sidebar.scss'

import WeatherForm from '../components/WeatherForm';

const Sidebar = () => {
    const navigate = useNavigate();

    const goToCrop = () => {
        // "/about" 경로로 이동
        navigate('/Crop');
    };

    const [answer, setAnswer] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');

    // 입력 값이 변경될 때 호출되는 함수
    const handleAnswerChange = (e) => {
        setAnswer(e.target.value);
    };

    useEffect(() => {
        switch (selectedCrop) {
            case 'empty':
                console.log('선택된 작물이 없습니다.');
            case 'potato':
                console.log('감자를 선택했습니다.');
                // 감자에 대한 조건문 처리
                break;
            case 'tomato':
                console.log('토마토를 선택했습니다.');
                // 토마토에 대한 조건문 처리
                break;
            case 'strawberry':
                console.log('딸기를 선택했습니다.');
                // 딸기에 대한 조건문 처리
                break;
            case 'watermelon':
                console.log('수박을 선택했습니다.');
                // 수박에 대한 조건문 처리
                break;
            default:
                console.log('선택된 작물이 없습니다.');
        }
    }, [selectedCrop]);

    return (
        <div className='sidebar'>
            <div className='content-wrap'>
                <div className='input-wrap'>
                    <WeatherForm/>
                    <input
                        className="search__input"
                        type="number"
                        id="searchInput"
                        placeholder="평수를 입력해주세요."
                        value={answer}
                        onChange={handleAnswerChange}
                    />
                </div>
                <h4>지도를 마우스로 클릭하면 다각형 그리기가 시작되고, 오른쪽 마우스를 클릭하면 다각형 그리기가 종료됩니다.</h4>
                <div>
                    <button onClick={goToCrop}>Go to Crop</button>
                </div>
            </div>
        </div>
    )

}

export default Sidebar


// 검색시 추천해줄 장소를 미리 세팅 -> 세팅된 좌표에 대한 마커 표시 및 사이드 바 정보 출력 -> 좌표 별 예상 수확량 출력(할 수 있으면)