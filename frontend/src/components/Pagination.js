import React from 'react';

function Pagination({ pageNo, totalCount, numOfRows, setPageNo }) {
  const totalPages = Math.ceil(totalCount / numOfRows);

  const handleNextPage = () => {
    if (pageNo < totalPages) {
      setPageNo(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 1) {
      setPageNo(prevPage => prevPage - 1);
    }
  };

  return (
    <div>
      <button onClick={handlePrevPage} disabled={pageNo === 1}>
        이전
      </button>
      <span>{pageNo} / {totalPages}</span>
      <button onClick={handleNextPage} disabled={pageNo >= totalPages}>
        다음
      </button>
    </div>
  );
}

export default Pagination;
