// src/components/molecules/Header.tsx
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto w-full max-w-[360px] bg-[#FEFBF2]">
        <div className="flex h-16 items-center px-4">
          <a href='/'>
            <img
                src="/agzak-logo.svg"
                alt="Agzak Logo"
                className="h-10 object-contain"
              />
          </a>
          <div className="ml-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="열기"
                  className="rounded-full hover:bg-zinc-900/5"
                >
                      <HamburgerIcon className="w-7 h-7" />
                      </Button>
              </SheetTrigger>

              {/* 사이드바 우측 출현 */}
              <SheetContent side="right" className="w-[320px] p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/** 3줄 햄버거 아이콘 (Tailwind로 간단 구현) */
function HamburgerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

/** 사이드바 내용 */

function SidebarContent() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2">
        <img
          src="/agzak-logo.svg"
          alt="Agzak Logo"
          className="h-10 object-contain" 
        />
      </div>
      <nav className="px-2 py-2 space-y-1 font-bitbit">
        <SidebarItem label="운세 보기" href="/fortune" />
        <SidebarItem label="운세 강화" href="/enforce" />
        <SidebarItem label="운세 달력" href="/calendar" />
        <SidebarItem label="쿠키 먹기" href="/cookies" />
        <SidebarItem label="마이페이지" href="/my" />
      </nav>
      <div className="mt-auto px-4 py-3 text-xs text-zinc-500">@ agzak  v1.0.0</div>
    </div>
  );
}

function SidebarItem({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
    >
      <span>{label}</span>
    </a>
  );
}