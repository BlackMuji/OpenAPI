import React, { useState, useEffect } from 'react'
import '../scss/sidebar.scss'

const Sidebar = () => {
    const [answer, setAnswer] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('');

    // 입력 값이 변경될 때 호출되는 함수
    const handleAnswerChange = (e) => {
        setAnswer(e.target.value);
    };

    useEffect(() => {
        switch (selectedCrop) {
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
            <div className='input-wrap'>
                <select
                    className="select-crop"
                    name="crops"
                    id="crops"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                >
                    <option value="potato">감자</option>
                    <option value="tomato">토마토</option>
                    <option value="strawberry">딸기</option>
                    <option value="watermelon">수박</option>
                </select>
                <input
                    className="search__input"
                    type="number"
                    id="searchInput"
                    placeholder="평수를 입력해주세요."
                    value={answer}
                    onChange={handleAnswerChange}
                />
            </div>
        </div>
    )
}

export default Sidebar
