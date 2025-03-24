import React from 'react';

type FundCardProps = {
  // main app page card props
  title: string;
  uId: string;
  token: string;
  status: 'live' | 'funding' | 'trading' | 'soon';
  imgSrc: string;
};

const FundCard: React.FC<FundCardProps> = (props) => {
  const statusStyles = {
    live: 'bg-[#f3aeae] text-[#af0505]',
    funding: 'bg-[#ebb6ff] text-[#6e0892]',
    trading: 'bg-green-300 text-[#000]',
    soon: 'bg-[#e4e4e4] text-[#5f5e60]',
  };

  return (
    <div className="h-full w-full pb-6 bg-[#1a1a1a] flex-col justify-start items-start gap-6 inline-flex">
      <div className="bg-white justify-center items-center inline-flex overflow-hidden w-full">
        <img className="w-full h-auto object-cover" src={props.imgSrc} alt={props.title} />
      </div>
      <div className="self-stretch h-auto px-4 flex-col justify-start items-start gap-4 flex">
        <div className="self-stretch justify-between items-center inline-flex">
          <div className="text-white text-lg md:text-xl font-semibold">{props.title}</div>
        </div>
        <div className="self-stretch items-center inline-flex">
          {props.token && <div className="text-center text-white text-lg md:text-xl font-bold">${props.token}</div>}
          {props.status && (
            <div
              className={`ml-auto px-2 py-1 rounded-sm flex justify-center items-center gap-2 ${statusStyles[props.status]}`}
            >
              <div className="text-center text-xs md:text-sm font-semibold">
                {props.status.charAt(0).toUpperCase() + props.status.slice(1)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundCard;
