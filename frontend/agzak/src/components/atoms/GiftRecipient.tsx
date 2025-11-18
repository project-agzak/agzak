// src/components/atoms/GiftRecipient.tsx
"use client"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/Command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import * as React from "react"

type UserOption = { id: number; nickname: string }

type Props = {
  /** 검색 함수(닉네임 쿼리 → 후보들) */
  searchUsers: (q: string) => Promise<UserOption[]>
  /** 선택 결과를 상위로 */
  onChange: (v: { userId?: number; nickname?: string }) => void
  value?: { userId?: number; nickname?: string }
  placeholder?: string
}

export function GiftRecipient({ searchUsers, onChange, value, placeholder = "받는 이를 검색하세요" }: Props) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [items, setItems] = React.useState<UserOption[]>([])
  const [loading, setLoading] = React.useState(false)

  //마지막으로 api호출한 query를 기억 
   const lastFetchedRef = React.useRef<string | null>(null)
  // 디바운스 검색
  React.useEffect(() => {
    const trimmed = query.trim()

    // 입력이 없으면: 목록 초기화 + 상태 리셋
    if (!trimmed) {
      setItems([])
      setLoading(false)
      lastFetchedRef.current = null
      return
    }

    // 🔒 같은 query로 이미 호출했으면 더 이상 호출 X
    if (lastFetchedRef.current === trimmed) {
      return
    }

    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await searchUsers(trimmed)
        setItems(r ?? [])
        // ✅ 이 query로는 호출 완료했다고 기록
        lastFetchedRef.current = trimmed
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(t)
    //  query만 의존하게: searchUsers는 바뀌지 않는다고 가정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleSelect = React.useCallback((user: UserOption) => {
    console.log('Selected user:', user)
    onChange({ userId: user.id, nickname: user.nickname })
    setOpen(false)
    setQuery("")          // 검색어 초기화
    setItems([])          // 목록도 정리
    lastFetchedRef.current = null // 다시 검색 가능하게 리셋
  }, [onChange])

  return (
    <div className="w-full space-y-2 flex flex-row">
      <label className="font-galmuri text-sm text-[#222]">To.</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="
              w-full h-10 border-b-2 border-b-black
              flex items-center px-3 justify-between active:scale-[0.99]
            "
            onClick={() => setOpen(true)}
          >
            <span className="font-galmuri-small  text-[13px] truncate">
              {value?.nickname || placeholder}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[230px] font-galmuri-small bg-white">
          <Command>
            <CommandInput
              placeholder="닉네임을 입력하세요…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandEmpty className="py-6 text-center text-sm">
              {loading ? "검색 중…" : "검색 결과가 없습니다"}
            </CommandEmpty>
            <CommandGroup>
              {items.map((u) => (
                <CommandItem
                  key={u.id}
                  value={u.nickname}
                  onSelect={() => handleSelect(u)}
                  className="cursor-pointer"
                >
                  <span className="font-galmuri">{u.nickname}</span>
                  <span className="ml-auto text-[11px] text-gray-500">@{u.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
