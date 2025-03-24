'use client';
import { Button } from '@/shadcn/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
// import Image from "next/image"

interface leaderboardData {
  id: number;
  icon: string;
  name: string;
  creator: string;
  price: number;
  dayVol: number;
  marketCap: number;
}

export const LeaderboardColumns: ColumnDef<leaderboardData>[] = [
  {
    accessorKey: 'name',
    header: 'DAO',
    cell: ({ row }) => {
      return (
        <div className="flex flex-row justify-start items-center gap-2">
          <div className="bg-white h-10 w-10">
            {/*<Image
              src={row.getValue("icon")}
              alt="DAO icon"
            />*/}
          </div>
          <p className={`text-xs font-medium leading-[18px] tracking-wide`}>{row.getValue('name')}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'creator',
    header: 'Creator',
    cell: ({ row }) => {
      return <p>@{row.getValue('creator')}</p>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row justify-start items-center gap-2">
          <Image src="/public/ethereum-icon.svg" alt={'Ethereum icon'} width={20} height={20} />
          <p>{row.getValue('price')}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'dayVol',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          24H Vol
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row justify-start items-center gap-2">
          <Image src="/public/ethereum-icon.svg" alt={'Ethereum icon'} width={20} height={20} />{' '}
          <p>{row.getValue('dayVol')}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'marketCap',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Mcap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row justify-start items-center gap-2">
          <Image src="/public/ethereum-icon.svg" alt={'Ethereum icon'} width={20} height={20} />
          <p className={'text-[#39db83]'}>
            {'+'}
            {row.getValue('marketCap')}
          </p>
        </div>
      );
    },
  },
];
