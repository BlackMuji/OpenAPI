import React, { useEffect, useState } from 'react';
import "../scss/kakao.scss";

// 1) 좌표를 다른 js 에 모아놓고 품목 선택하고 평수 검색하면 예상 수확량 나오면서 평수 맞게(?) 생산지 추천
// 2) 다각형 면적 계산하기 이용. 품목 선택하면 지역추천 몇 군데 해주고 해당영역에서 다각형 만들면 평수 나오고 예상 수확량 출력

const { kakao } = window;

const Kakao = () => {
    const [drawingFlag, setDrawingFlag] = useState(false);
    const [drawingPolygon, setDrawingPolygon] = useState(null);
    const [polygon, setPolygon] = useState(null);
    const [areaOverlay, setAreaOverlay] = useState(null);
    const [drawingEnabled, setDrawingEnabled] = useState(false);

    useEffect(() => {
        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3
        };
        const map = new kakao.maps.Map(container, options);

        const mapTypes = {
            terrain: kakao.maps.MapTypeId.TERRAIN,
            useDistrict: kakao.maps.MapTypeId.USE_DISTRICT
        };

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

        const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

        positions.forEach((position) => {
            const imageSize = new kakao.maps.Size(24, 35);
            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
            const marker = new kakao.maps.Marker({
                map: map,
                position: position.latlng,
                title: position.title,
                image: markerImage
            });
        });

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

        function setOverlayMapTypeId() {
            const chkTerrain = document.getElementById('chkTerrain');
            const chkUseDistrict = document.getElementById('chkUseDistrict');

            // 지도 타입을 제거합니다
            for (var type in mapTypes) {
                map.removeOverlayMapTypeId(mapTypes[type]);
            }

            // 지적편집도정보 체크박스가 체크되어있으면 지도에 지적편집도정보 지도타입을 추가합니다
            if (chkUseDistrict.checked) {
                map.addOverlayMapTypeId(mapTypes.useDistrict);
            }

            // 지형정보 체크박스가 체크되어있으면 지도에 지형정보 지도타입을 추가합니다
            if (chkTerrain.checked) {
                map.addOverlayMapTypeId(mapTypes.terrain);
            }
        }

        function relayout() {
            map.relayout();
        }

        function zoomIn() {
            map.setLevel(map.getLevel() - 1);
        }

        function zoomOut() {
            map.setLevel(map.getLevel() + 1);
        }

        function handleMapClick(mouseEvent) {
            if (!drawingEnabled) return;

            const clickPosition = mouseEvent.latLng;

            if (!drawingFlag) {
                setDrawingFlag(true);

                if (polygon) {
                    polygon.setMap(null);
                    setPolygon(null);
                }

                if (areaOverlay) {
                    areaOverlay.setMap(null);
                    setAreaOverlay(null);
                }

                const newDrawingPolygon = new kakao.maps.Polygon({
                    map: map,
                    path: [clickPosition],
                    strokeWeight: 3,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 1,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });

                setDrawingPolygon(newDrawingPolygon);

                const newPolygon = new kakao.maps.Polygon({
                    path: [clickPosition],
                    strokeWeight: 3,
                    strokeColor: '#00a0e9',
                    strokeOpacity: 1,
                    strokeStyle: 'solid',
                    fillColor: '#00a0e9',
                    fillOpacity: 0.2
                });

                setPolygon(newPolygon);
            } else {
                const drawingPath = drawingPolygon.getPath();
                drawingPath.push(clickPosition);
                drawingPolygon.setPath(drawingPath);

                const path = polygon.getPath();
                path.push(clickPosition);
                polygon.setPath(path);
            }
        }

        function handleMapMouseMove(mouseEvent) {
            if (!drawingFlag) return;

            const mousePosition = mouseEvent.latLng;
            const path = drawingPolygon.getPath();

            if (path.length > 1) {
                path.pop();
            }

            path.push(mousePosition);
            drawingPolygon.setPath(path);
        }

        function handleMapRightClick(mouseEvent) {
            if (!drawingFlag) return;

            drawingPolygon.setMap(null);
            setDrawingPolygon(null);

            const path = polygon.getPath();

            if (path.length > 2) {
                polygon.setMap(map);

                const area = Math.round(polygon.getArea());
                const content = `<div class="info">총면적 <span class="number">${area}</span> m<sup>2</sup></div>`;

                const newAreaOverlay = new kakao.maps.CustomOverlay({
                    map: map,
                    content: content,
                    xAnchor: 0,
                    yAnchor: 0,
                    position: path[path.length - 1]
                });

                setAreaOverlay(newAreaOverlay);
            } else {
                setPolygon(null);
            }

            setDrawingFlag(false);
        }

        kakao.maps.event.addListener(map, 'click', handleMapClick);
        kakao.maps.event.addListener(map, 'mousemove', handleMapMouseMove);
        kakao.maps.event.addListener(map, 'rightclick', handleMapRightClick);

        document.getElementById('chkUseDistrict').addEventListener('click', () => setOverlayMapTypeId('chkTerrain'));
        document.getElementById('chkTerrain').addEventListener('click', () => setOverlayMapTypeId('chkUseDistrict'));
        document.getElementById('btnRoadmap').addEventListener('click', () => setMapType('roadmap'));
        document.getElementById('btnSkyview').addEventListener('click', () => setMapType('skyview'));
        document.querySelector('.custom_zoomcontrol span:nth-child(1)').addEventListener('click', zoomIn);
        document.querySelector('.custom_zoomcontrol span:nth-child(2)').addEventListener('click', zoomOut);

        return () => {
            kakao.maps.event.removeListener(map, 'click', handleMapClick);
            kakao.maps.event.removeListener(map, 'mousemove', handleMapMouseMove);
            kakao.maps.event.removeListener(map, 'rightclick', handleMapRightClick);
        };
    }, [drawingFlag, drawingPolygon, polygon, areaOverlay, drawingEnabled]);

    const toggleDrawing = () => {
        setDrawingEnabled(!drawingEnabled);
        setDrawingFlag(false);
        if (drawingPolygon) {
            drawingPolygon.setMap(null);
            setDrawingPolygon(null);
        }
        if (polygon) {
            polygon.setMap(null);
            setPolygon(null);
        }
        if (areaOverlay) {
            areaOverlay.setMap(null);
            setAreaOverlay(null);
        }
    };

    return (
        <div className="map_wrap">
            <div id="map" style={{ width: "100%", height: "100%" }}></div>
            <div className="custom_Overlaycontrol">
                <label className="custom_checkbox">
                    <input type="checkbox" id="chkUseDistrict" onclick="setOverlayMapTypeId()" />
                    <span>지적편집도 정보 보기</span>
                </label>
                <label className="custom_checkbox">
                    <input type="checkbox" id="chkTerrain" onclick="setOverlayMapTypeId()" />
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
            <div className="custom_drawcontrol">
                <button onClick={toggleDrawing}>
                    {drawingEnabled ? '다각형 그리기 중지' : '다각형 그리기 시작'}
                </button>
            </div>
        </div>
    );
}

export default Kakao;
