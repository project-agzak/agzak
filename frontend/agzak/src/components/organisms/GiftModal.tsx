// src/components/organisms/GiftModal.tsx
"use client"

import giftpaper from "@/assets/ui/letter-paper.webp"
import { GiftMessageBox } from "@/components/atoms/GiftMessageBox"
import { GiftRecipient } from "@/components/atoms/GiftRecipient"
import { GiftSendButton } from "@/components/atoms/GiftSendButton"
import { GiftTitle } from "@/components/atoms/GiftTitle"
import { SuccessModal } from "@/components/organisms/GiftSuccessModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import * as React from "react"

type SubmitPayload = { 
  receiverId: number
  cookieId: number
  message: string 
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  CookieSrc: string
  cookieId: number
  /** 닉네임 검색 API */
  searchUsers: (q: string) => Promise<{ id: number; nickname: string }[]>
  /** 전송 핸들러 */
  onSubmit: (payload: SubmitPayload) => Promise<void>
  onSuccessClose?: () => void 
}

export function GiftModal({ open, onOpenChange, CookieSrc, cookieId, searchUsers, onSubmit, onSuccessClose }: Props) {
  const [to, setTo] = React.useState<{ userId?: number; nickname?: string }>({})
  const [msg, setMsg] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSubmit =
    (!!to.userId || !!(to.nickname && to.nickname.trim().length > 0)) &&
    msg.trim().length > 0

  const handleSubmit = async () => {
    console.log('Submit attempt:', { to, msg, cookieId, canSubmit })
    
    if (!canSubmit || loading) {
      console.warn('Cannot submit:', { canSubmit, loading })
      return
    }
    
    if (!to.userId) {
      console.error('No userId selected')
      setError("받는 사람을 선택해주세요")
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const payload = {
        receiverId: to.userId,
        cookieId: cookieId,
        message: msg.trim()
      }
      console.log('Sending payload:', payload)
      
      await onSubmit(payload)
      setShowSuccess(true)
    } catch (error) {
      console.error('Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : "선물 전송에 실패했습니다"
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    console.log('Closing success modal')
    setShowSuccess(false)
    onOpenChange(false)
    setTo({})
    setMsg("")
    setError(null)
    // 부모에게 "성공 모달 닫힘" 알림
    onSuccessClose?.()
  }

  React.useEffect(() => {
    if (!open) {
      setTo({})
      setMsg("")
      setError(null)
      setShowSuccess(false)
    }
  }, [open])

  if (showSuccess) {
    return (
      <SuccessModal
        open={showSuccess}
        onClose={handleSuccessClose}
      />
    )
  }


  return (
    <>
      <Dialog open={open && !showSuccess} onOpenChange={onOpenChange}>
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
              {error && (
                  <p className="text-red-500 text-xs font-galmuri-small text-center">
                    {error}
                  </p>
                )}
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
      <SuccessModal
        open={showSuccess}
        onClose={handleSuccessClose}
      />
    </>
  )
}