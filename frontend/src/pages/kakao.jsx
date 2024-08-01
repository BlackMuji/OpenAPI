import React, { useEffect, useRef } from 'react';
import "../scss/kakao.scss";

const { kakao } = window;

const Kakao = () => {
    const mapRef = useRef(null); // 지도 인스턴스를 참조
    const drawingFlag = useRef(false); // 다각형 그리기 상태 플래그
    const drawingPolygon = useRef(null); // 현재 그리고 있는 다각형 객체
    const polygon = useRef(null); // 그리기 완료된 다각형 객체
    const areaOverlay = useRef(null); // 다각형 면적 정보를 표시하는 커스텀 오버레이

    // 지형 정보 및 지적 편집도 정보 지도를 사용
    useEffect(() => {
        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도 시작 좌표
            level: 3
        };
        const map = new kakao.maps.Map(container, options);
        mapRef.current = map;

        const mapTypes = {
            terrain: kakao.maps.MapTypeId.TERRAIN,
            useDistrict: kakao.maps.MapTypeId.USE_DISTRICT
        };

        // 마커 좌표 (연습용)
        const positions = [ 
            {
                title: '카카오',
                latlng: new kakao.maps.LatLng(33.450705, 126.570677)
            },
            {
                title: '생태연못',
                latlng: new kakao.maps.LatLng(33.450936, 126.569477)
            },
            {
                title: '텃밭',
                latlng: new kakao.maps.LatLng(33.450879, 126.569940)
            },
            {
                title: '근린공원',
                latlng: new kakao.maps.LatLng(33.451393, 126.570738)
            }
        ]; 

        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; // 마커 이미지 URL

        // 위치 별로 각각 마커 생성
        positions.forEach((position) => {   
            const imageSize = new kakao.maps.Size(24, 35); // 마커 이미지 크기
            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
            const marker = new kakao.maps.Marker({
                map: map,
                position: position.latlng,
                title: position.title,
                image: markerImage
            });
        }); 

        // 지도 타입 변경 함수 (일반 지도 / 스카이뷰)
        function setMapType(maptype) {  
            const roadmapControl = document.getElementById('btnRoadmap');
            const skyviewControl = document.getElementById('btnSkyview');
            if (maptype === 'roadmap') {
                map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
                roadmapControl.className = 'selected_btn';
                skyviewControl.className = 'btn';
            } else {
                map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
                skyviewControl.className = 'selected_btn';
                roadmapControl.className = 'btn';
            }
        }   

        // 지형 정보 및 지적 편집도 정보 지도 오버레이 설정 함수
        function setOverlayMapTypeId() {    
            const chkTerrain = document.getElementById('chkTerrain');
            const chkUseDistrict = document.getElementById('chkUseDistrict');

            // 비활성화 체크 후 오버레이 제거
            for (var type in mapTypes) {
                map.removeOverlayMapTypeId(mapTypes[type]);
            }

            // 지적 편집도 정보 오버레이 추가
            if (chkUseDistrict.checked) {   
                map.addOverlayMapTypeId(mapTypes.useDistrict);
            }

            // 지형 정보 오버레이 추가
            if (chkTerrain.checked) {
                map.addOverlayMapTypeId(mapTypes.terrain);
            }
        } 

        // 지도 확대 함수
        function zoomIn() { 
            map.setLevel(map.getLevel() - 1);
        }

        // 지도 축소 함수
        function zoomOut() {    
            map.setLevel(map.getLevel() + 1);
        }

        // 지도 클릭 이벤트 핸들러
        function handleMapClick(mouseEvent) {
            const clickPosition = mouseEvent.latLng;

            if (!drawingFlag.current) {
                drawingFlag.current = true;

                if (polygon.current) {
                    polygon.current.setMap(null);
                    polygon.current = null;
                }

                if (areaOverlay.current) {
                    areaOverlay.current.setMap(null);
                    areaOverlay.current = null;
                }

                drawingPolygon.current = new kakao.maps.Polygon({
                    map: map,
                    path: [clickPosition],
                    strokeWeight: 3,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 1,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });

                polygon.current = new kakao.maps.Polygon({
                    path: [clickPosition],
                    strokeWeight: 3,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 1,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });
            } else {
                const drawingPath = drawingPolygon.current.getPath();
                drawingPath.push(clickPosition);
                drawingPolygon.current.setPath(drawingPath);

                const path = polygon.current.getPath();
                path.push(clickPosition);
                polygon.current.setPath(path);
            }
        }

        // 지도 마우스 이동 이벤트 핸들러
        function handleMapMouseMove(mouseEvent) {
            if (!drawingFlag.current) return;

            const mousePosition = mouseEvent.latLng;
            const path = drawingPolygon.current.getPath();

            if (path.length > 1) {
                path.pop();
            }

            path.push(mousePosition);
            drawingPolygon.current.setPath(path);
        }

        // 지도 마우스 오른쪽 클릭 이벤트 핸들러
        function handleMapRightClick(mouseEvent) {
            if (!drawingFlag.current) return;

            drawingPolygon.current.setMap(null);
            drawingPolygon.current = null;

            const path = polygon.current.getPath();

            if (path.length > 2) {
                polygon.current.setMap(map);

                const area = Math.round(polygon.current.getArea());
                const content = `<div class="info">총면적 <span class="number">${area}</span> m<sup>2</sup></div>`;

                areaOverlay.current = new kakao.maps.CustomOverlay({
                    map: map,
                    content: content,
                    xAnchor: 0,
                    yAnchor: 0,
                    position: path[path.length - 1]
                });
            } else {
                polygon.current = null;
            }

            drawingFlag.current = false;
        }

        // 이벤트 리스너 등록
        kakao.maps.event.addListener(map, 'click', handleMapClick);
        kakao.maps.event.addListener(map, 'mousemove', handleMapMouseMove);
        kakao.maps.event.addListener(map, 'rightclick', handleMapRightClick);

        // 지도 타입 및 오버레이 컨트롤 이벤트 등록
        document.getElementById('chkUseDistrict').addEventListener('click', () => setOverlayMapTypeId());
        document.getElementById('chkTerrain').addEventListener('click', () => setOverlayMapTypeId());
        document.getElementById('btnRoadmap').addEventListener('click', () => setMapType('roadmap'));
        document.getElementById('btnSkyview').addEventListener('click', () => setMapType('skyview'));
        document.querySelector('.custom_zoomcontrol span:nth-child(1)').addEventListener('click', zoomIn);
        document.querySelector('.custom_zoomcontrol span:nth-child(2)').addEventListener('click', zoomOut);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            kakao.maps.event.removeListener(map, 'click', handleMapClick);
            kakao.maps.event.removeListener(map, 'mousemove', handleMapMouseMove);
            kakao.maps.event.removeListener(map, 'rightclick', handleMapRightClick);
        };
    }, []);

    return (
        <div className="map_wrap">
            <div id="map" style={{ width: "100%", height: "100%" }}></div>
            <div className="custom_Overlaycontrol">
                <label className="custom_checkbox">
                    <input type="checkbox" id="chkUseDistrict" />
                    <span>지적편집도 정보 보기</span>
                </label>
                <label className="custom_checkbox">
                    <input type="checkbox" id="chkTerrain" />
                    <span>지형정보 보기</span>
                </label>
            </div>
            <div className="custom_typecontrol radius_border">
                <span id="btnRoadmap" className="selected_btn">지도</span>
                <span id="btnSkyview" className="btn">스카이뷰</span>
            </div>
            <div className="custom_zoomcontrol radius_border">
                <span><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png" alt="확대" /></span>
                <span><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png" alt="축소" /></span>
            </div>
        </div>
    );
}

export default Kakao;
