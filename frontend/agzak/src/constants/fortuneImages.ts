// src/constants/fortuneImages.ts
const S3_BASE =
  "https://ssafy-agzak.s3.ap-northeast-2.amazonaws.com/fortune";

export const FORTUNE_IMAGES: string[] = Array.from({ length: 34 }, (_, i) => {
  const idx = i + 1;
  return `${S3_BASE}/${idx}.webp`;
});
