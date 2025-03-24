'use client';
import { useState } from 'react';
import Image from 'next/image';
import { PageLayout } from '@/components/page-layout';
import { ClipboardCopy } from 'lucide-react';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import ClickToCopy from '@/components/copyToClipboard';
import { shortenAddress } from '@/utils/address';
export default function Page() {
  // Example data
  const creator = 'eidiolabs';
  const recipientAddress = 'HF77...K8X4';
  const tokenSymbol = 'MODE';
  const tokenGoal = 1350;
  const usdGoal = 173891.3; // $173,891.30

  // Dynamic progress
  const [committed, setCommitted] = useState<number>(172);
  const [inputValue, setInputValue] = useState<string>('');

  const progressPercent = 80; // Fixed at 12.74% to match screenshot

  function handleContribute() {
    const amount = Number.parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0) {
      setCommitted((prev) => prev + amount);
      setInputValue('');
    }
  }

  return (
    <PageLayout title="contribution" description="contribution">
      <div className="flex items-center justify-center p-4 bg-[#101010] border-gray-800 border rounded-xl mt-12">
        <div className="w-full max-w-3xl text-white">
          <div className="flex gap-6 mb-8">
            <div className="relative w-32 h-32 overflow-hidden rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-24%20at%209.00.01%E2%80%AFAM-2i8q88SqdShvxPua07QZcvNYtcbegG.png"
                alt="Sorceror Artwork"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-left">Sorceror</h1>
              <p className="text-gray-400 text-base leading-relaxed text-left">
                Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac
                aliquet odio mattis.
              </p>

              <div className="mt-8 flex justify-between">
                <div className="flex flex-col  items-start mb-1 justify-start">
                  <p className="text-[#C4F82A] font-medium">Fundraise Goal</p>
                  <p className="text-sm font-bold">1350 MODE ($173,891.30)</p>
                </div>

                <div className="flex items-start justify-start flex-col gap-2">
                  <span className="text-white">Creator</span>
                  <div className="flex items-center gap-2">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-24%20at%209.00.01%E2%80%AFAM-2i8q88SqdShvxPua07QZcvNYtcbegG.png"
                      alt="Sorceror Artwork"
                      className="object-cover"
                      width={20}
                      height={20}
                    />
                    <a href="#" className="text-blue-400 text-xs underline">
                      eidiolabs
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="mb-4">
                <div className="w-full h-6 bg-[#1A1A1A] rounded-md overflow-hidden">
                  <div className="h-full bg-[#8B5CF6]" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="text-right mt-2 text-sm">{progressPercent}%</div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient Address</span>
                  <div className="bg-[#053738] p-1 rounded-2xl flex gap-x-2 px-3">
                    <p className="text-sm sm:text-base lg:text-lg">{shortenAddress('')}</p>
                    <ClickToCopy copyText={''} className="text-teal-20" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funding Goal</span>
                  <span>MODE 1350 ($173,891.3)</span>
                </div>
              </div>
              <div className="bg-black rounded-lg p-4 mb-8 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold">Tier Bronze</h3>
                  <div className="w-6 h-6 rounded-full bg-amber-600"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <p className="text-gray-400 mb-1">Max</p>
                    <p className="text-xl">---</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Committed</p>
                    <p className="text-xl">---</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full">
                <Input
                  type="text"
                  placeholder="Enter the Amount"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="rounded-r-none text-black bg-white flex-1 h-10 text-lg"
                />
                <Button
                  onClick={handleContribute}
                  className="rounded-l-none bg-[#C4F82A] text-black hover:bg-[#D5FF3A] h-10 px-8 text-lg font-medium"
                >
                  Contribute
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
