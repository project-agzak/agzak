import CollectionImg from '@/assets/Background/Collection.svg'

export default function AppError() {

  return (
    <main className="relative z-10 p-4 min-h-screen">
        <div className="flex flex-col justify-center items-center">
            <p className="font-bitbit-large">나의 쿠키 도감</p>
            <p className='mt-2 font-galmuri'>모은 쿠키</p>
            <span className='font-galmuri'>00 / 00</span>
        </div>
        <div className='flex justify-center mt-10'>
          <img src={ CollectionImg } alt="" />
        </div>
    </main>
  );
}
