import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  useKakaoLoaderOrigin({
    appkey: "b9becd801fa8759cfc9575ffef54b14d",
    libraries: ["clusterer", "drawing", "services"],
  })
}