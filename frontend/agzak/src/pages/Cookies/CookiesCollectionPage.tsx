// src/pages/Cookies/CookiesCollectionPage.tsx
import { useEffect, useMemo, useState } from "react";
import CollectionImg from "@/assets/Background/Collection.svg";

import AchievementCookie from "@/assets/Cookies/achievement-cookie.webp";
import DeveloperCookie from "@/assets/Cookies/developer-cookie.webp";
import GloomyCookie from "@/assets/Cookies/gloomy-cookie.webp";
import HealthCookie from "@/assets/Cookies/health-cookie.webp";
import LavaCookie from "@/assets/Cookies/lava-cookie.webp";
import LoveCookie from "@/assets/Cookies/love-cookie.webp";
import MixedCookie from "@/assets/Cookies/mixed-cookie.webp";
import MoneyCookie from "@/assets/Cookies/money-cookie.webp";
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
import { CookieCloverItem } from "@/components/molecules/CookieCloverItem";
import type { FortuneCookieDetail } from "@/types/cookies";

const COOKIE_IMAGE_BY_CODE: Record<CollectionCookieCode, string> = {
  GLOOMY: GloomyCookie,
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

const COOKIE_LABEL_BY_CODE: Partial<Record<CollectionCookieCode, string>> = {
  GLOOMY: "먹구름 쿠키",
  SANSAM: "산삼 쿠키",
  DEVELOPER: "개발자 쿠키",
  MIXED: "믹스 쿠키",
  MONEY: "금전 쿠키",
  LOVE: "애정 쿠키",
  ACHIEVEMENT: "성취 쿠키",
  HEALTH: "건강 쿠키",
  ROTTEN: "썩은 쿠키",
  LAVA: "용암 쿠키",
  SANTA: "산타 쿠키",
  UNICORN: "유니콘 쿠키",
};

const TITLE = "레시피"

export const COOKIE_DETAIL_BY_CODE: Record<CollectionCookieCode, FortuneCookieDetail> = {
  GLOOMY: {
    title: TITLE,
    effects: [
      { label: "모든 운이 -10 이하" },
      { label: "등급: EPIC" },
    ],
  },

  SANSAM: {
    title: TITLE,
    effects: [
      { label: "금전운이 +20 이상, 건강운이 +20 이상일 때"},
      { label: "등급: EPIC" },
    ],
  },

  DEVELOPER: {
    title: TITLE,
    effects: [
      { label: "금전운이 +10 이상, 동시에 건강운이 -10 이하일 때" },
      { label: "등급: EPIC" },
    ],
  },

  MIXED: {
    title: TITLE,
    effects: [
      { label: "모든 운 +10 이상" },
      { label: "등급: EPIC" },
    ],
  },

  MONEY: {
    title: TITLE,
    effects: [
      { label: "금전운이 가장 높고, 금전운이 +5 이상, 총운이 +10 이상일 때" },
      { label: "등급: RARE" },
    ],
  },

  LOVE: {
    title: TITLE,
    effects: [
      { label: "애정운이 가장 높고, 애정운이 +5 이상, 총운이 +10 이상일 때" },
      { label: "등급: RARE" },
    ],
  },

  ACHIEVEMENT: {
    title: TITLE,
    effects: [
      { label: "성취운이 가장 높고, 성취운이 +5 이상, 총운이 +10 이상일 때"},
      { label: "등급: RARE"},
    ],
  },

  HEALTH: {
    title: TITLE,
    effects: [
      { label: "건강운이 가장 높고, 건강운이 +5 이상, 총운이 +10 이상일 때" },
      { label: "등급: RARE" },
    ],
  },

  ROTTEN: {
    title: TITLE,
    effects: [
      { label: "잘 구워 주세요..." },
      { label: "등급: RARE" },
    ],
  },

  LAVA: {
    title: TITLE,
    effects: [
      { label: "금전운·애정운·성취운·건강운이 모두 -20 이하일 때" },
      { label: "등급: UNIQUE" },
    ],
  },

  SANTA: {
    title: TITLE,
    effects: [
      { label: "애정운이 +12, 동시에 건강운이 +25일 때" },
      { label: "등급: UNIQUE" },
    ],
  },

  UNICORN: {
    title: TITLE,
    effects: [
      { label: "모든 운 +22 이상" },
      { label: "등급: UNIQUE",},
    ],
  },
};


export default function CookiesCollectionPage() {
  const { myCollection, isLoadingMy, myError, loadMyCollection } =
    useCollectionStore();

  const [selectedCode, setSelectedCode] = useState<CollectionCookieCode | null>(null);

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
        imageSrc: discovered ? COOKIE_IMAGE_BY_CODE[code] ?? SecretCookie : SecretCookie,
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
              pointer-events-auto
              absolute inset-x-0 top-[1.5%] bottom-[8%] left-[3%] right-[3%]
              grid grid-cols-3 justify-items-center
            "
          >
            {pageSlots.map((slot) => {
              const discovered = slot.discovered;

              // 발견 안 한 쿠키는 ??? / 버블도 대충 막아주고 싶으면 이렇게
              const detail: FortuneCookieDetail = discovered
                ? COOKIE_DETAIL_BY_CODE[slot.code]
                : {
                    title: "???",
                    effects: [],
                  };

              return (
                <div
                  key={slot.code}
                  className="flex items-center justify-center flex-col"
                >
                  <CookieCloverItem
                    id={slot.code}
                    imgSrc={slot.imageSrc}
                    detail={detail}
                    selected={selectedCode === slot.code}
                    onSelect={(id) => {
                      if (!discovered) return;
                      setSelectedCode(prev => (prev === id ? null : id as CollectionCookieCode));
                    }}
                  />

                  <span className="font-galmuri-xsmall text-center -translate-y-3">
                    {discovered
                      ? COOKIE_LABEL_BY_CODE[slot.code] ?? "???"
                      : "???"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
