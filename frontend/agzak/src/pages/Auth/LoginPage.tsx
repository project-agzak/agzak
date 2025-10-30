import Logo from '@/assets/Background/agzak-logo.svg'

export default function LoginPage() {
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className='flex w-full justify-center ml-2 mt-5'>
        <img src={Logo} alt="아그작" className="block mx-auto" />
      </div>
    </main>
  );
}
