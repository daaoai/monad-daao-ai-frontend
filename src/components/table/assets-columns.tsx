'use client';

import { ColumnDef } from '@tanstack/react-table';

type Asset = {
  token: string;
  // tokenIcon?: string
  balance: number;
  price: number;
  totalValue: number;
};

export const assetColumns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        {/* <Image
          src={row.original.tokenIcon || "/placeholder.svg"}
          alt=""
          width={24}
          height={24}
          className="rounded-full"
        /> */}
        <span>{row.original.token}</span>
      </div>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => row.original.balance.toFixed(2),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <span>$&nbsp;{row.original.price}</span>,
  },
  {
    accessorKey: 'totalValue',
    header: 'Total Value',
    cell: ({ row }) => <span>$&nbsp;{row.original.totalValue.toFixed(2)}</span>,
  },
];
