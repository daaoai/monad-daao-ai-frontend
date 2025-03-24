import { Button } from '@/shadcn/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shadcn/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface dashboardTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DashboardTable<TData, TValue>({ columns, data }: dashboardTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-xl border border-[#27292a] overflow-hidden text-left">
      <Table className="p-4">
        <TableHeader className="bg-[#0d0d0d] border-t border-b border-[#121212]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[#e4e6e7] h-16 text-sm font-normal font-['Work Sans'] tracking-wide"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="border-b border-[#121212] last:border-b-0">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-start space-x-2 py-4 px-4 bg-[#0d0d0d] border-t border-[#121212]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="w-8 h-8 p-0 bg-transparent border-none hover:bg-[#121212]"
        >
          <ChevronLeft className="h-4 w-4 text-[#e4e6e7]" />
        </Button>
        <div className="flex items-center space-x-2">
          {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(page - 1)}
              className={`w-6 h-8 p-1 ${
                table.getState().pagination.pageIndex === page - 1
                  ? 'bg-[#0c1e39] text-[#e4e6e7] font-medium'
                  : 'bg-transparent text-[#e4e6e7] font-normal hover:bg-[#121212]'
              } rounded-xl`}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="w-8 h-8 p-0 bg-transparent border-none hover:bg-[#121212]"
        >
          <ChevronRight className="h-4 w-4 text-[#e4e6e7]" />
        </Button>
      </div>
    </div>
  );
}
