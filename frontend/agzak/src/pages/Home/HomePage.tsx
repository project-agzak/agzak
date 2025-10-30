export default function HomePage() {
  return (
    <main className="relative z-10 p-4 min-h-screen">
      <div className="flex justify-center">
        <p className="font-bitbit-large">오늘의 운세</p>
      </div>
      <div className="bg-white/80 rounded-2xl px-5 py-4 shadow">
        <p className="text-center font-medium">행운을 열어볼까요? 🥠</p>
        <p className="font-galmuri-xsmall">갈무리 폰트 xsmall</p>
        <p className="font-galmuri-small">갈무리 폰트 small</p>
        <p className="font-galmuri">갈무리 폰트 base</p>
        <p className="font-galmuri-large">갈무리 폰트 large</p>
        <p className="font-galmuri-xlarge">갈무리 폰트 xlarge</p>
        
        <br />

        <p className="font-bitbit-xsmall">DNF 폰트xsmall</p>
        <p className="font-bitbit-small">DNF 폰트 small</p>
        <p className="font-bitbit">DNF 폰트 base</p>
        <p className="font-bitbit-large">DNF 폰트 large</p>
        <p className="font-bitbit-xlarge">DNF 폰트 xlarge</p>
      </div>
    </main>
  );
}
