// @/pages/Enforce/EnforcePage.tsx
"use client"

import { OvenCookButton } from "@/components/atoms/OvenCookButton"
import { OvenHeader } from "@/components/atoms/OvenHeader"
import OvenHelpSheet from "@/components/atoms/OvenHelpSheet"
import OvenImage from "@/components/atoms/OvenImage"
import { OvenStatus } from "@/components/atoms/OvenStatus"
import { OvenAspectPanel } from "@/components/molecules/OvenAspectPanel"
import OvenLoading from "@/components/molecules/OvenLoading"
import OvenResult from "@/components/molecules/OvenResult"
import { useOvenGame } from "@/hooks/useOvenGame"
import { useState } from "react"

export default function EnforcePage() {
  const [helpOpen, setHelpOpen] = useState(false)
  const game = useOvenGame()
  const [shakeKey, setShakeKey] = useState(0)
  const [view, setView] = useState<"game" | "loading" | "result">("game")
  const handleCook = () => {
    setView("loading")
    setTimeout(() => setView("result"), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8">
      {view === "game" && (
        <>
          <OvenHeader onHelp={() => setHelpOpen(true)} />
          <div>
            <p className="font-bitbit-large flex justify-center">강화 쿠키 오븐</p>
            <p className="font-galmuri-small flex justify-center pt-2">확률을 기반으로 <br />적합한 버튼을 눌러보자!</p>
          </div>
          <div className="w-full max-w-[420px] px-4 space-y-4">
          <OvenImage lastSuccess={game.lastSuccess} triggerKey={shakeKey} />
            <OvenStatus remaining={game.remaining} successProb={game.successProb} />
            <OvenAspectPanel
              snap={game.snap}
              onSelect={(aspect) => {
                game.attempt(aspect)
                setShakeKey((k) => k + 1) // 흔들림 트리거

                // 진동
                if (navigator.vibrate) navigator.vibrate(80)
              }}
              disabled={game.isCompleted || game.loading}
            />
            <OvenCookButton
              enabled={game.isCompleted}
              onClick={handleCook} 
            />
          </div>
          <OvenHelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
      )}
      {view === "loading" && <OvenLoading />}

      {view === "result" && <OvenResult />}
    </main>
  );
}
