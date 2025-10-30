import FullnameLogo from '@/assets/Background/agzak-fullname.svg'
import FortuneCookie from '@/assets/Gifs/FortuneCookie.gif'

export default function FortunePage() {
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex flex-col items-center">
        <img src={FortuneCookie} alt="FortuneCookie" />
        <img src={FullnameLogo} alt="Agzak Fullname" />
      </div>
    </main>
  );
}
