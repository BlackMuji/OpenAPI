import React, { useEffect } from 'react';
import "../scss/kakao.scss";

const { kakao } = window;

function Kakao() {
    useEffect(() => {
        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(33.450701, 126.570667),
            level: 3
        };
        const map = new kakao.maps.Map(container, options);

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

        function zoomIn() {
            map.setLevel(map.getLevel() - 1);
        }

        function zoomOut() {
            map.setLevel(map.getLevel() + 1);
        }

        document.getElementById('btnRoadmap').addEventListener('click', () => setMapType('roadmap'));
        document.getElementById('btnSkyview').addEventListener('click', () => setMapType('skyview'));
        document.querySelector('.custom_zoomcontrol span:nth-child(1)').addEventListener('click', zoomIn);
        document.querySelector('.custom_zoomcontrol span:nth-child(2)').addEventListener('click', zoomOut);
    }, []);

    return (
        <div className="map_wrap">
            <div id="map" style={{ width: "100%", height: "100%"}}></div>
            <div className="custom_typecontrol radius_border">
                <span id="btnRoadmap" className="selected_btn">지도</span>
                <span id="btnSkyview" className="btn">스카이뷰</span>
            </div>
            <div className="custom_zoomcontrol radius_border">
                <span><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png" alt="확대"/></span>
                <span><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png" alt="축소"/></span>
            </div>
        </div>
    );
}

export default Kakao;
