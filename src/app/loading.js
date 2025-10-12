import Image from 'next/image';
import logoSrc from '../components/images/N.png';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shadow-lg">
          <Image src={logoSrc} alt="Nyxora" width={140} height={140} className="object-cover" />
        </div>

        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-lg sm:text-xl font-medium">Se încarcă…</span>
        </div>
      </div>
    </div>
  );
}
