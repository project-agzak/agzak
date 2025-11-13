// src/components/organisms/GiftModal.tsx
"use client"

import giftpaper from "@/assets/ui/letter-paper.webp"
import { GiftMessageBox } from "@/components/atoms/GiftMessageBox"
import { GiftRecipient } from "@/components/atoms/GiftRecipient"
import { GiftSendButton } from "@/components/atoms/GiftSendButton"
import { GiftTitle } from "@/components/atoms/GiftTitle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import * as React from "react"

type SubmitPayload = { toUserId?: number; nickname?: string; message: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  CookieSrc: string
  /** 닉네임 검색 API */
  searchUsers: (q: string) => Promise<{ id: number; nickname: string }[]>
  /** 전송 핸들러 */
  onSubmit: (payload: SubmitPayload) => Promise<void>
}

export function GiftModal({ open, onOpenChange, CookieSrc, searchUsers, onSubmit }: Props) {
  const [to, setTo] = React.useState<{ userId?: number; nickname?: string }>({})
  const [msg, setMsg] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const canSubmit =
    (!!to.userId || !!(to.nickname && to.nickname.trim().length > 0)) &&
    msg.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      await onSubmit({ ...to, message: msg.trim() })
      onOpenChange(false)
      setTo({})
      setMsg("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          p-0
          bg-transparent border-none
          overflow-visible
          flex items-center justify-center
        "
      >
        {/* 봉투 배경 */}
        <div className="relative w-[340px]">
          <img
            src={giftpaper}
            alt=""
            className="
              block
              w-[340px]   /* 필요하면 여기 폭만 조절 */
              h-auto
              pointer-events-none
              select-none
            "
          />
          <div
            className="
              absolute inset-0
              flex flex-col
              pt-5 pb-8 px-5   /* 위/아래 여백은 이미지 안 여백에 맞춰 조절 */
            "
          >
            <DialogHeader className="p-0 mb-3">
            <DialogTitle asChild>
              <GiftTitle CookieSrc={CookieSrc} />
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 pb-5 pt-2 space-y-3">
            <GiftRecipient
              value={to}
              onChange={setTo}
              searchUsers={searchUsers}
            />

            <GiftMessageBox value={msg} onChange={setMsg} maxLength={50} className="mb-3" />
              <div className="flex justify-center pr-1 ml-1.5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="
                    text-[12px] font-galmuri-small
                    text-gray-500 hover:text-gray-700
                    underline-offset-2 hover:underline
                    active:scale-[0.97] transition
                    mb-7
                  "
                >
                  닫기
                </button>
              </div>
            <div className="pt-2 flex justify-center">
              <GiftSendButton
                canSubmit={canSubmit}
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
