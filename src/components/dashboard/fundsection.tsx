'use client';

import * as React from 'react';
import FundCard from '@/components/dashboard/fund-card';
import { Fund } from '@/types/fund';
import Carousel from '../carousel';
import { useRouter } from 'next/navigation';
interface FundSectionProps {
  title?: string;
  subtitle?: string;
  funds: Fund[];
  onFundClick: (fundId: string) => void;
}

export function FundSection({ title, subtitle, funds, onFundClick }: FundSectionProps) {
  const router = useRouter();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
      <div className="relative">
        <Carousel slidesToShowConfig={{ laptop: 3, tablet: 2, mobile: 1 }}>
          {funds.map((fund, index) => (
            <button
              key={index}
              title="btn"
              onClick={(e) => {
                e.preventDefault();
                if (fund.status === 'trading') {
                  onFundClick(fund.id);
                } else if (fund.status === 'soon') {
                  router.push('/dapp/contribution');
                }
              }}
              className={`block w-full px-4 h-fit`}
            >
              <FundCard
                title={fund.title}
                token={fund.token || ''}
                uId={fund.id}
                status={fund.status}
                imgSrc={fund.imgSrc}
              />
            </button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
