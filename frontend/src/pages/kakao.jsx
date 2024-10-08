import React, { useRef, useState, useEffect } from 'react';
import { Map, MapTypeId, Polygon, CustomOverlayMap, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from "./useKakaoLoader";
import "../scss/kakao.scss";

function Kakao({ center }) {
  useKakaoLoader();

  const mapRef = useRef(null);
  const [mapType, setMapType] = useState("roadmap");  // 맵 타입 설정 변수
  const [overlayMapTypeId, setOverlayMapTypeId] = useState({  // 맵 오버레이(지형정보, 지적편집도) 상태 변수
    TERRAIN: false,
    USE_DISTRICT: false,
  });
  const [map, setMap] = useState(null);
  const [isdrawing, setIsdrawing] = useState(false);  // 그리기 활성화 상태 변수
  const [polygon, setPolygon] = useState(); // 도형 폴리곤 상태 변수
  const [paths, setPaths] = useState([]); // 마우스 이동 좌표 추적 변수
  const [mousePosition, setMousePosition] = useState({  // 도형 꼭지점 좌표 변수
    lat: 0,
    lng: 0,
  });
  const [isDrawingActive, setIsDrawingActive] = useState(false) // 도형 그리기 활성화 상태

  const [regionName, setRegionName] = useState("");
  const [regionCode, setRegionCode] = useState("");

  const [info, setInfo] = useState(null);
  const [markers, setMarkers] = useState([]);

  const zoomIn = () => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;
    mapInstance.setLevel(mapInstance.getLevel() - 1);
  };

  const zoomOut = () => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;
    mapInstance.setLevel(mapInstance.getLevel() + 1);
  };

  const handleClick = (_map, mouseEvent) => { // 좌클릭 시 활성화(도형 그리기 시작)
    if (!isDrawingActive) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const latlng = mouseEvent.latLng

      const callback = (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addressName = result[0].address_name;
          const regionCode = result[0].code;
          
          // API 호출 결과로 지역 명칭과 행정구역 코드를 저장
          setRegionName(addressName);
          setRegionCode(regionCode);

          console.log("region: ",addressName, regionCode);
        }
      };
      // coord2RegionCode를 사용하여 좌표에 해당하는 정보를 가져옴
      geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), callback);

      return
    };
    if (!isdrawing) {
      setPaths([]);
    }
    setPaths((prev) => [
      ...prev,
      {
        lat: mouseEvent.latLng.getLat(),
        lng: mouseEvent.latLng.getLng(),
      },
    ]);
    setIsdrawing(true);
  };

  const handleMouseMove = (_map, mouseEvent) => {
    if (!isDrawingActive) return // 활성화 상태일 때만 동작
    setMousePosition({
      lat: mouseEvent.latLng.getLat(),
      lng: mouseEvent.latLng.getLng(),
    });
  };

  const handleRightClick = (_map, _mouseEvent) => { // 도형 그리기 종료
    if (!isDrawingActive) return // 활성화 상태일 때만 동작
    setIsdrawing(false);
  };

  const handleActivateDrawing = (e) => {
    setIsDrawingActive(e.target.checked) // 체크박스 상태에 따라 활성화/비활성화
  }

  return (
    <div className='map_wrap'>
      <Map // 지도를 표시할 Container 
        id={`map`}
        center={center}
        style={{
          width: "100%",
          height: "100%",
        }}
        mapTypeId={mapType === "roadmap" ? "ROADMAP" : "HYBRID"}
        ref={mapRef}
        level={3}
        onClick={handleClick}
        onRightClick={handleRightClick}
        onMouseMove={handleMouseMove}
        onCreate={setMap}
      >
        {/* 지도타입 컨트롤 div 입니다 */}
        {overlayMapTypeId.USE_DISTRICT && <MapTypeId type={"USE_DISTRICT"} />}
        {overlayMapTypeId.TERRAIN && <MapTypeId type={"TERRAIN"} />}
        <div className="custom_Overlaycontrol">
          <label className="custom_checkbox">
            <input type="checkbox" checked={isDrawingActive}
              onChange={handleActivateDrawing}
            />
            <span>도형 그리기</span>
          </label>
          <label className="custom_checkbox">
            <input type="checkbox" id="chkUseDistrict"
              onChange={(e) => setOverlayMapTypeId((p) => ({ ...p, USE_DISTRICT: e.target.checked }))}
            />
            <span>지적편집도 정보 보기</span>
          </label>
          <label className="custom_checkbox">
            <input type="checkbox" id="chkTerrain"
              onChange={(e) => setOverlayMapTypeId((p) => ({ ...p, TERRAIN: e.target.checked }))}
            />
            <span>지형정보 보기</span>
          </label>
        </div>
        <div className="custom_typecontrol radius_border">
          <span
            id="btnRoadmap"
            className={mapType === "roadmap" ? "selected_btn" : "btn"}
            onClick={() => setMapType("roadmap")}
          >
            지도
          </span>
          <span
            id="btnSkyview"
            className={mapType === "skyview" ? "selected_btn" : "btn"}
            onClick={() => setMapType("skyview")}
          >
            스카이뷰
          </span>
        </div>
        {/* 지도 확대, 축소 컨트롤 div 입니다 */}
        <div className="custom_zoomcontrol radius_border">
          <span onClick={zoomIn}>
            <img
              src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png"
              alt="확대"
            />
          </span>
          <span onClick={zoomOut}>
            <img
              src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png"
              alt="축소"
            />
          </span>
        </div>
        <Polygon
          path={isdrawing ? [...paths, mousePosition] : paths}
          strokeWeight={3}
          strokeColor={"#00a0e9"}
          strokeOpacity={1}
          strokeStyle={"solid"}
          fillColor={"#00a0e9"}
          fillOpacity={0.2}
          onCreate={setPolygon}
        />
        {!isdrawing && paths.length > 2 && polygon && (
          <CustomOverlayMap position={paths[paths.length - 1]}>
            <div className="info">
              총면적{" "}
              <span className="number">{Math.round(polygon.getArea())}</span> m<sup>2</sup>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
}

export default Kakao;




/*
// 장소 검색 기능 추가
useEffect(() => {
  if (!map || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;

  const ps = new window.kakao.maps.services.Places();
  ps.keywordSearch("광주", (data, status, _pagination) => {
    if (status === window.kakao.maps.services.Status.OK) {
      const bounds = new window.kakao.maps.LatLngBounds();
      const newMarkers = [];

      for (let i = 0; i < 1; i++) {
        newMarkers.push({
          position: {
            lat: data[i].y,
            lng: data[i].x,
          },
          content: data[i].place_name,
        });

        bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
      }

      setMarkers(newMarkers);
      map.setBounds(bounds);
    }
  });
}, [map]); */
