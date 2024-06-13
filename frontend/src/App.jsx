import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 기존 컴포넌트
import Main from './pages/main';


const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
