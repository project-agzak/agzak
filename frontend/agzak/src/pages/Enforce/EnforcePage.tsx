// @/pages/Enforce/EnforcePage.tsx
"use client"

import { useEffect, useState } from "react"

import { Button_L } from "@/components/atoms/Button_L"
import { OvenCookButton } from "@/components/atoms/OvenCookButton"
import { OvenHeader } from "@/components/atoms/OvenHeader"
import OvenHelpSheet from "@/components/atoms/OvenHelpSheet"
import OvenImage from "@/components/atoms/OvenImage"
import { OvenStatus } from "@/components/atoms/OvenStatus"
import { OvenAspectPanel } from "@/components/molecules/OvenAspectPanel"
import OvenLoading from "@/components/templates/OvenLoading"
import OvenResult from "@/components/templates/OvenResult"

import { useOvenGame } from "@/hooks/useOvenGame"
import { useSessionQuotaStore } from "@/store/sessionQuotaStore"

export default function EnforcePage() {
  const [helpOpen, setHelpOpen] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [view, setView] = useState<"game" | "loading" | "result">("game")

  const game = useOvenGame()

  // cap/remaining을 스토어에서 읽고, 마운트 시 최신화
  const { quota, loading: quotaLoading, error: quotaError, refresh } = useSessionQuotaStore()
  useEffect(() => { refresh() }, [refresh])

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
    // cap 동적 표기 (로딩/에러 방어)
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
                확률을 기반으로 <br />적합한 버튼을 눌러보자!
              </p>
            </header>

            <OvenImage lastSuccess={game.lastSuccess} triggerKey={shakeKey} />

            <OvenStatus remaining={game.remaining} successProb={game.successProb} />

            <OvenAspectPanel
              snap={game.snap}
              onSelect={(aspect) => {
                game.attempt(aspect)
                setShakeKey((k) => k + 1) // 흔들림 트리거
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
