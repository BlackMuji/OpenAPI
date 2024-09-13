import { CROP_API_URL, CROP_API_KEY } from '../data/Config';

export const fetchWeatherData = async (pageNo, numOfRows, ST_YM, ED_YM, AREA_ID, PA_CROP_SPE_ID, dataType = 'XML', extraRows = 5) => {
  const totalRows = numOfRows + extraRows; // 추가 데이터를 포함해 요청
  const endpoint = `${CROP_API_URL}/getMmStatistics?serviceKey=${CROP_API_KEY}&pageNo=${pageNo}&numOfRows=${totalRows}&dataType=${dataType}&ST_YM=${ST_YM}&ED_YM=${ED_YM}&AREA_ID=${AREA_ID}&PA_CROP_SPE_ID=${PA_CROP_SPE_ID}`;

  console.log("API Request URL:", endpoint);

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const responseText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, 'application/xml');

    const items = xmlDoc.getElementsByTagName('item');
    if (items.length === 0) {
      throw new Error('No data found in API response');
    }

    const data = Array.from(items).map(item => ({
      areaId: item.getElementsByTagName('areaId')[0]?.textContent || 'N/A',
      areaName: item.getElementsByTagName('areaName')[0]?.textContent || 'N/A',
      mnhAvgRhm: item.getElementsByTagName('mnhAvgRhm')[0]?.textContent || 'N/A',
      mnhAvgTa: item.getElementsByTagName('mnhAvgTa')[0]?.textContent || 'N/A',
      mnhAvgWs: item.getElementsByTagName('mnhAvgWs')[0]?.textContent || 'N/A',
      mnhMaxTa: item.getElementsByTagName('mnhMaxTa')[0]?.textContent || 'N/A',
      mnhMinRhm: item.getElementsByTagName('mnhMinRhm')[0]?.textContent || 'N/A',
      mnhMinTa: item.getElementsByTagName('mnhMinTa')[0]?.textContent || 'N/A',
      mnhSumRn: item.getElementsByTagName('mnhSumRn')[0]?.textContent || 'N/A',
      mnhSumSs: item.getElementsByTagName('mnhSumSs')[0]?.textContent || 'N/A',
      paCropName: item.getElementsByTagName('paCropName')[0]?.textContent || 'N/A',
      paCropSpeId: item.getElementsByTagName('paCropSpeId')[0]?.textContent || 'N/A',
      paCropSpeName: item.getElementsByTagName('paCropSpeName')[0]?.textContent || 'N/A',
      wrnCd: item.getElementsByTagName('wrnCd')[0]?.textContent || 'N/A',
      wrnCount: item.getElementsByTagName('wrnCount')[0]?.textContent || 'N/A',
      ym: item.getElementsByTagName('ym')[0]?.textContent || 'N/A',
    }));

    const totalCountElement = xmlDoc.getElementsByTagName('totalCount')[0];
    const totalCount = totalCountElement ? parseInt(totalCountElement.textContent, 10) : 0;

    console.log("Parsed Data:", data);
    console.log("Total Count:", totalCount);

    return { items: data, totalCount: totalCount };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

