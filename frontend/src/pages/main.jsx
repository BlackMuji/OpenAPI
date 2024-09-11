import React, { useState } from 'react'
import Kakao from './kakao.jsx'
import Sidebar from './sidebar.jsx'
import WeatherForm from '../components/WeatherForm.jsx'

const Main = () => {
    const [center, setCenter] = useState({
        lat: 37.498004414546934,
        lng: 127.02770621963765,
      });
    
      const handleSelectRegion = (coords) => {
        console.log('Coordinates received in Main:', coords);
        setCenter(coords);
      };
      
    
    return (
        <header>
            <Sidebar>
                <WeatherForm onSelectRegion={handleSelectRegion} />
            </Sidebar>
            <Kakao center={center}/>
        </header>
    )
}
    
export default Main;
