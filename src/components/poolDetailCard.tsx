import { abbreviateNumber } from '@/utils/numbers';

const PoolDetailCard = ({ marketCap, liquidity, volume }: { marketCap: number; liquidity: number; volume: number }) => {
  return (
    <div className="flex space-x-8 bg-black text-white shadow-md w-full">
      <div className="flex flex-col gap-2 border-t border-gray-20 pt-2 items-start justify-start">
        <p className="text-lightYellow font-rubik text-base font-normal">MARKETCAP</p>
        <p className="text-2xl text-white font-normal">${abbreviateNumber(marketCap)}</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-20 pt-2 shadow-md items-start justify-start">
        <p className="text-lightYellow font-rubik text-base font-normal">LIQUIDITY</p>
        <p className="text-2xl text-white font-normal">${abbreviateNumber(liquidity)}</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-20 pt-2 shadow-md items-start justify-start">
        <p className="text-lightYellow font-rubik text-base font-normal">VOLUME</p>
        <p className="text-2xl text-white font-normal">${abbreviateNumber(volume)}</p>
      </div>
    </div>
  );
};

export default PoolDetailCard;
