import raw from "@/data/korea-administrative-district.json";

export type SimpleRegion = {
  sido: string;
  sgg: string;
  label: string; // 예: "충청북도 청주시"
};

type RawData = {
  name: string;
  version: string;
  url: string;
  data: Array<Record<string, string[]>>;
};

const typed = raw as unknown as RawData;

// 🔁 { "서울특별시": ["종로구", "중구", ...] } 배열 → 평탄화된 리스트로
export const SIMPLE_REGIONS: SimpleRegion[] = typed.data.flatMap((obj) => {
  const [sido, sggList] = Object.entries(obj)[0];
  return sggList.map((sgg) => ({
    sido,
    sgg,
    label: `${sido} ${sgg}`,
  }));
});
