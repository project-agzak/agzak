// @/pages/Enforce/EnforcePage.tsx
"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button_L } from "@/components/atoms/Button_L"
import { OvenCookButton } from "@/components/atoms/OvenCookButton"
import { OvenHeader } from "@/components/atoms/OvenHeader"
import OvenHelpSheet from "@/components/atoms/OvenHelpSheet"
import OvenImage from "@/components/atoms/OvenImage"
import { OvenStatus } from "@/components/atoms/OvenStatus"
import { OvenAspectPanel } from "@/components/molecules/OvenAspectPanel"
import OvenLoading from "@/components/templates/OvenLoading"
import OvenResult from "@/components/templates/OvenResult"

import { FireSelector } from "@/components/atoms/FireSelector"
import { useOvenGame } from "@/hooks/useOvenGame"
import { useSessionQuotaStore } from "@/store/sessionQuotaStore"
import type { OvenFireType } from "@/types/oven"

export default function EnforcePage() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [view, setView] = useState<"game" | "loading" | "result">("game")
  const [fire, setFire] = useState<OvenFireType>("WEAK") // 강/약불 상태
  const navigate = useNavigate()
  const ENFORCE_HELP_KEY = "agzak:enforce_help_seen"

  const game = useOvenGame()
  const { quota, loading: quotaLoading, error: quotaError, refresh } = useSessionQuotaStore()

  useEffect(() => { refresh() }, [refresh])

  // ✅ 최초 진입 + 캐시 비어 있을 때만 도움말 자동 오픈
  useEffect(() => {
    if (game.initLoading || game.initError) return

    // "캐시가 비어 있는 상태" 정의 (상황에 맞게 조정 가능)
    const hasHistory =
      !!game.lastCookie ||
      (Array.isArray(game.snap) && game.snap.length > 0)

    if (hasHistory) return

    if (typeof window !== "undefined") {
      const alreadySeen = window.localStorage.getItem(ENFORCE_HELP_KEY) === "1"
      if (!alreadySeen) {
        setHelpOpen(true)
        window.localStorage.setItem(ENFORCE_HELP_KEY, "1")
      }
    }
  }, [game.initLoading, game.initError, game.lastCookie, game.snap])


  // ✅ 훅이 아닌 "일반 변수"로 즉시 계산 (조건부 return보다 위에 위치)
  const base = Number(game.successProb) || 0
  const delta = fire === "WEAK" ? +5 : -5
  const displayProb = Math.min(100, Math.max(0, base + delta))
  // 에러 발생 시 안전하게 홈으로 리디렉션
  useEffect(() => {
    if (game.initError) {
      console.error("[ENFORCE] 초기화 에러 감지, 홈으로 리디렉션:", game.initError)
      navigate("/", { replace: true })
    }
  }, [game.initError, navigate])



  if (game.initLoading) {
    return (
      <main className="min-h-screen py-4">
        <section className="w-full max-w-[420px] mx-auto px-4">
          <OvenLoading />
        </section>
      </main>
    )
  }
  if (game.blocked === "LIMIT") {
    const capText =
      quotaError ? "일일 세션 한도" :
      quotaLoading ? "세션" :
      `${quota?.cap ?? "?"}`

    return (
      <main className="min-h-screen grid place-items-center">
        <section className="w-full max-w-[420px] px-4 text-center">
          <p className="font-galmuri-small mx-4">
            오늘의 세션 {capText}회를 모두 사용했어요
            <br />내일 다시 도전해봐요!
          </p>
          <br />
          <Button_L label="쿠키 먹으러 가기" to="/cookies" />
        </section>
      </main>
    )
  }

  if (game.blocked === "NO_MEMBER") {
    return (
      <main className="min-h-screen py-4">
        <section className="w-full max-w-[420px] mx-auto px-4 text-center">
          <OvenHeader onHelp={() => setHelpOpen(true)} />
          <p className="font-galmuri mt-6">로그인이 필요합니다.</p>
        </section>
      </main>
    )
  }

  const handleCook = () => {
    if (!game.isCompleted) return
    setView("loading")
    setTimeout(() => setView("result"), 3000)
  }

  return (
    <main className="min-h-screen py-4">
      <section className="w-full max-w-[420px] mx-auto px-4">
        {view === "game" && (
          <div className="flex flex-col gap-4">
            <OvenHeader onHelp={() => setHelpOpen(true)} />

            <header className="text-center">
              <p className="font-bitbit-large">강화 쿠키 오븐</p>
              <p className="font-galmuri-small pt-2">
                확률을 기반으로 <br />손잡이와 버튼을 눌러보자!
              </p>
            </header>

            <OvenImage lastSuccess={game.lastSuccess} triggerKey={shakeKey} />

            {/* 강불/약불 토글 */}
            <FireSelector selected={fire} onChange={setFire} />

            {/* 선택한 불꽃 반영 확률 표시 */}
            <OvenStatus remaining={game.remaining} successProb={displayProb} />

            <OvenAspectPanel
              snap={game.snap}
              onSelect={(aspect) => {
                game.attempt(aspect, fire) // STRONG/WEAK 반영
                setShakeKey((k) => k + 1)
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate?.(80)
                }
              }}
              disabled={game.isCompleted || game.loading}
            />

            <OvenCookButton enabled={game.isCompleted} onClick={handleCook} />

            <OvenHelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
          </div>
        )}

        {view === "loading" && (
          <div className="flex flex-col">
            <OvenLoading />
          </div>
        )}

        {view === "result" && (
          <div className="flex flex-col">
            <OvenResult cookie={game.lastCookie ?? undefined} />
          </div>
        )}
      </section>
    </main>
  )
}
