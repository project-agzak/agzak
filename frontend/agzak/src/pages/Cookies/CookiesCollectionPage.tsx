// src/pages/Cookies/CookiesCollectionPage.tsx
import { useEffect, useMemo } from "react";
import CollectionImg from "@/assets/Background/Collection.svg";

import AchievementCookie from "@/assets/Cookies/achievement-cookie.webp";
import DeveloperCookie from "@/assets/Cookies/developer-cookie.webp";
import GloomyCookie from "@/assets/Cookies/gloomy-cookie.webp";
import HealthCookie from "@/assets/Cookies/health-cookie.webp";
import LavaCookie from "@/assets/Cookies/lava-cookie.webp";
import LoveCookie from "@/assets/Cookies/love-cookie.webp";
import MixedCookie from "@/assets/Cookies/mixed-cookie.webp";
import MoneyCookie from "@/assets/Cookies/money-cookie.webp";
import PpepperoCookie from "@/assets/Cookies/ppeppero-cookie.webp";
import RottenCookie from "@/assets/Cookies/rotten-cookie.webp";
import SansamCookie from "@/assets/Cookies/sansam-cookie.webp";
import SantaCookie from "@/assets/Cookies/santa-cookie.webp";
import UnicornCookie from "@/assets/Cookies/unicorn-cookie.webp";
import SecretCookie from "@/assets/Cookies/secret-cookie.webp";

import {
  COLLECTION_COOKIE_CODES,
  type CollectionCookieCode,
} from "@/lib/collectionAPI";
import { useCollectionStore } from "@/store/useCollectionStore";

const COOKIE_IMAGE_BY_CODE: Record<CollectionCookieCode, string> = {
  GLOOMY: GloomyCookie,
  PPEPPERO: PpepperoCookie,
  SANSAM: SansamCookie,
  DEVELOPER: DeveloperCookie,
  MIXED: MixedCookie,
  MONEY: MoneyCookie,
  LOVE: LoveCookie,
  ACHIEVEMENT: AchievementCookie,
  HEALTH: HealthCookie,
  ROTTEN: RottenCookie,
  LAVA: LavaCookie,
  SANTA: SantaCookie,
  UNICORN: UnicornCookie,
};

export default function CookiesCollectionPage() {
  const { myCollection, isLoadingMy, myError, loadMyCollection } =
    useCollectionStore();

  // 첫 마운트 시 내 도감 불러오기
  useEffect(() => {
    if (!myCollection) {
      void loadMyCollection();
    }
  }, [myCollection, loadMyCollection]);

  const totalTypes = COLLECTION_COOKIE_CODES.length;

  const { collectedCount, orderedSlots } = useMemo(() => {
    const slots = COLLECTION_COOKIE_CODES.map((code) => {
      const dto = myCollection?.find((c) => c.code === code);
      const discovered = dto && dto.count > 0;

      return {
        code,
        discovered,
        imageSrc: discovered ? COOKIE_IMAGE_BY_CODE[code] : SecretCookie,
      };
    });

    const collected = slots.filter((s) => s.discovered).length;

    return {
      collectedCount: collected,
      orderedSlots: slots,
    };
  }, [myCollection]);

  // 한 페이지에 12개 (3 x 4)
  const pageSlots = orderedSlots.slice(0, 12);

  return (
    <main className="relative z-10 min-h-screen p-4">
      <div className="flex flex-col items-center justify-center">
        <p className="font-bitbit-large">나의 쿠키 도감</p>
        <p className="mt-2 font-galmuri-small">모은 쿠키</p>
        <span className="font-galmuri">
          {String(collectedCount).padStart(2, "0")} /{" "}
          {String(totalTypes).padStart(2, "0")}
        </span>
      </div>

      {/* 로딩 / 에러 메시지 */}
      {isLoadingMy && (
        <p className="mt-4 text-center font-galmuri text-sm">불러오는 중...</p>
      )}
      {myError && !isLoadingMy && (
        <p className="mt-4 text-center font-galmuri text-sm text-red-500">
          쿠키 도감을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <div className="relative w-[300px] max-w-full">
          {/* 선반 배경 */}
          <img
            src={CollectionImg}
            alt=""
            className="pointer-events-none select-none w-full"
          />

          <div
            className="
              pointer-events-none
              absolute inset-x-0 top-[5%] bottom-[8%] left-[3%] right-[3%]
              grid grid-cols-3 justify-items-center
              gap-y-3
            "
          >
            {pageSlots.map((slot) => (
              <div key={slot.code} className="flex items-center justify-center">
                <img
                  src={slot.imageSrc}
                  alt=""
                  className="h-[90px] w-[90px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
