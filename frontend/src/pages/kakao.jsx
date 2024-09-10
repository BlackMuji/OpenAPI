import React, { useEffect, useRef, useState } from 'react';
import "../scss/kakao.scss";

const { kakao } = window;

const Kakao = () => {
    const mapRef = useRef(null);
    const drawingFlag = useRef(false);
    const drawingPolygon = useRef(null);
    const polygon = useRef(null);
    const areaOverlay = useRef(null);
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        // Kakao Maps API가 로드되었는지 확인
        if (typeof kakao === 'undefined' || !kakao.maps) {
            console.error("Kakao Maps API가 로드되지 않았습니다.");
            return;
        }

        kakao.maps.load(() => {
            const container = document.getElementById('map');
            const options = {
                center: new kakao.maps.LatLng(33.450701, 126.570667),
                level: 3
            };
            const mapInstance = new kakao.maps.Map(container, options);
            mapRef.current = mapInstance;

            const mapTypes = {
                terrain: kakao.maps.MapTypeId.TERRAIN,
                useDistrict: kakao.maps.MapTypeId.USE_DISTRICT
            };

            // 지형 정보 및 지적 편집도 지도 타입 설정 함수
            const setMapType = (maptype) => {
                const roadmapControl = document.getElementById('btnRoadmap');
                const skyviewControl = document.getElementById('btnSkyview');
                if (maptype === 'roadmap') {
                    mapInstance.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
                    roadmapControl.className = 'selected_btn';
                    skyviewControl.className = 'btn';
                } else {
                    mapInstance.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
                    skyviewControl.className = 'selected_btn';
                    roadmapControl.className = 'btn';
                }
            };

            // 지형 정보 및 지적 편집도 지도 오버레이 설정 함수
            const setOverlayMapTypeId = () => {
                const chkTerrain = document.getElementById('chkTerrain');
                const chkUseDistrict = document.getElementById('chkUseDistrict');

                for (let type in mapTypes) {
                    mapInstance.removeOverlayMapTypeId(mapTypes[type]);
                }

                if (chkUseDistrict.checked) {
                    mapInstance.addOverlayMapTypeId(mapTypes.useDistrict);
                }

                if (chkTerrain.checked) {
                    mapInstance.addOverlayMapTypeId(mapTypes.terrain);
                }
            };

            const zoomIn = () => {
                mapInstance.setLevel(mapInstance.getLevel() - 1);
            };

            const zoomOut = () => {
                mapInstance.setLevel(mapInstance.getLevel() + 1);
            };

            // 지도 클릭 이벤트 핸들러
            const handleMapClick = (mouseEvent) => {
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
                        map: mapInstance,
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
            };

            const handleMapMouseMove = (mouseEvent) => {
                if (!drawingFlag.current) return;

                const mousePosition = mouseEvent.latLng;
                const path = drawingPolygon.current.getPath();

                if (path.length > 1) {
                    path.pop();
                }

                path.push(mousePosition);
                drawingPolygon.current.setPath(path);
            };

            const handleMapRightClick = () => {
                if (!drawingFlag.current) return;

                drawingPolygon.current.setMap(null);
                drawingPolygon.current = null;

                const path = polygon.current.getPath();

                if (path.length > 2) {
                    polygon.current.setMap(mapInstance);

                    const area = Math.round(polygon.current.getArea());
                    const content = `<div class="info">총면적 <span class="number">${area}</span> m<sup>2</sup></div>`;

                    areaOverlay.current = new kakao.maps.CustomOverlay({
                        map: mapInstance,
                        content: content,
                        xAnchor: 0,
                        yAnchor: 0,
                        position: path[path.length - 1]
                    });
                } else {
                    polygon.current = null;
                }

                drawingFlag.current = false;
            };

            // 장소 검색 객체 생성 (Kakao API 로드가 완료된 후 실행)
            if (window.kakao.maps.services) {
                const ps = new kakao.maps.services.Places();
                ps.keywordSearch('이태원', ps_callback);
                    
                function ps_callback(data, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        setPlaces(data);

                        const bounds = new kakao.maps.LatLngBounds();
                        data.forEach((place) => {
                            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
                        });
                        mapInstance.setBounds(bounds);
                    }
                };

            } else {
                console.error('Kakao Maps services is not available');
            }

            // 지도 이벤트 리스너 등록
            kakao.maps.event.addListener(mapInstance, 'click', handleMapClick);
            kakao.maps.event.addListener(mapInstance, 'mousemove', handleMapMouseMove);
            kakao.maps.event.addListener(mapInstance, 'rightclick', handleMapRightClick);

            // 컨트롤 UI 이벤트 등록
            document.getElementById('chkUseDistrict').addEventListener('click', setOverlayMapTypeId);
            document.getElementById('chkTerrain').addEventListener('click', setOverlayMapTypeId);
            document.getElementById('btnRoadmap').addEventListener('click', () => setMapType('roadmap'));
            document.getElementById('btnSkyview').addEventListener('click', () => setMapType('skyview'));
            document.querySelector('.custom_zoomcontrol span:nth-child(1)').addEventListener('click', zoomIn);
            document.querySelector('.custom_zoomcontrol span:nth-child(2)').addEventListener('click', zoomOut);

            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            return () => {
                kakao.maps.event.removeListener(mapInstance, 'click', handleMapClick);
                kakao.maps.event.removeListener(mapInstance, 'mousemove', handleMapMouseMove);
                kakao.maps.event.removeListener(mapInstance, 'rightclick', handleMapRightClick);
            };
        });
    }, []);

    // 검색된 장소마다 마커 표시
    useEffect(() => {
        if (mapRef.current && places.length > 0) {
            places.forEach((place) => {
                const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; // 마커 이미지 URL
                const imageSize = new kakao.maps.Size(24, 35); // 마커 이미지 크기
                const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                const marker = new kakao.maps.Marker({
                    map: mapRef.current,
                    position: new kakao.maps.LatLng(place.y, place.x),
                    image: markerImage
                });

                const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
                kakao.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}</div>`);
                    infowindow.open(mapRef.current, marker);
                });
            });
        }
    }, [mapRef.current, places]);

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
