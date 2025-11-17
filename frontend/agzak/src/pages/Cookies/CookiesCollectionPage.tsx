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
import LuckyCookie from "@/assets/Cookies/lucky-cookie.webp";

import {
  COLLECTION_COOKIE_CODES,
  type CollectionCookieCode,
  type CollectionCookieDto,
} from "@/lib/collectionAPI";

import { useCollectionStore } from "@/store/useCollectionStore";
import { CookieCollectionItem } from "@/components/molecules/CookieCollectionItem";
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
  LUCKY: LuckyCookie,
};

const buildDetailFromDto = (dto: CollectionCookieDto): FortuneCookieDetail => {
  return {
    title: "레시피",
    effects: [
      { label: dto.recipe },
      { label: `등급: ${dto.rarityCode}` },
    ],
  };
};

export default function CookiesCollectionPage() {
  const { myCollection, isLoadingMy, myError, loadMyCollection } =
    useCollectionStore();

  const [selectedCode, setSelectedCode] =
    useState<CollectionCookieCode | null>(null);

  // 첫 마운트 시 내 도감 불러오기
  useEffect(() => {
    if (!myCollection) {
      void loadMyCollection();
    }
  }, [myCollection, loadMyCollection]);

  const totalTypes = COLLECTION_COOKIE_CODES.length;

  const { collectedCount, orderedSlots, luckySlot } = useMemo(() => {
    const slots = COLLECTION_COOKIE_CODES.map((code) => {
      const dto = myCollection?.find((c) => c.code === code);
      const discovered = !!dto && (dto.count ?? 0) > 0;

      return {
        code,
        discovered,
        dto,
        imageSrc: discovered
          ? COOKIE_IMAGE_BY_CODE[code] ?? SecretCookie
          : SecretCookie,
      };
    });

    const collected = slots.filter((s) => s.discovered).length;
    const lucky = slots.find((s) => s.code === "LUCKY") ?? null;

    return {
      collectedCount: collected,
      orderedSlots: slots,
      luckySlot: lucky,
    };
  }, [myCollection]);

  // 3 x 4 그리드에는 LUCKY 제외
  const pageSlots = orderedSlots
    .filter((s) => s.code !== "LUCKY")
    .slice(0, 12);

  const luckyDetail: FortuneCookieDetail =
    luckySlot?.discovered && luckySlot.dto
      ? buildDetailFromDto(luckySlot.dto)
      : { title: "???", effects: [] };

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
              const dto = slot.dto ?? undefined;

              const detail: FortuneCookieDetail =
                discovered && dto
                  ? buildDetailFromDto(dto)
                  : {
                      title: "???",
                      effects: [],
                    };

              return (
                <div
                  key={slot.code}
                  className="flex items-center justify-center flex-col"
                >
                  <CookieCollectionItem
                    id={slot.code}
                    imgSrc={slot.imageSrc}
                    detail={detail}
                    selected={selectedCode === slot.code}
                    onSelect={(id) => {
                      if (!discovered) return; // 못 얻은 쿠키는 클릭 무시
                      setSelectedCode((prev) =>
                        prev === id ? null : (id as CollectionCookieCode)
                      );
                    }}
                  />

                  <span className="font-galmuri-xsmall text-center -translate-y-3">
                    {discovered ? dto?.name ?? "???" : "???"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 럭키 쿠키: 아래에 크게 1칸 */}
      <div className="mt-10 flex flex-col items-center justify-center">
        <p className="font-galmuri-small mb-2">특별한 행운 쿠키</p>

        <CookieCollectionItem
          id="LUCKY"
          imgSrc={luckySlot?.discovered ? COOKIE_IMAGE_BY_CODE.LUCKY : SecretCookie}
          detail={luckyDetail}
          selected={selectedCode === "LUCKY"}
          onSelect={(id) => {
            if (!luckySlot?.discovered) return;
            setSelectedCode((prev) =>
              prev === id ? null : (id as CollectionCookieCode)
            );
          }}
        />

        <span className="font-galmuri text-center mt-1">
          {luckySlot?.discovered ? luckySlot.dto?.name ?? "럭키 쿠키" : "???"}
        </span>
      </div>
    </main>
  );
}
