'use client';
import React from 'react';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
interface CollectedTicketsProps {
  tickets: bigint[] | undefined;
  onClose: () => void;
}
const CollectedTickets: React.FC<CollectedTicketsProps> = ({ tickets, onClose }) => {
  return (
    <Card className="w-full max-w-lg bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl shadow-lg text-white">
      <CardHeader className="flex flex-row justify-between items-center px-6 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-white">Collected Tickets</CardTitle>
        </div>
        <button
          className="text-gray-400 hover:text-white transition-all"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <XCircle size={22} />
        </button>
      </CardHeader>

      <CardContent className="p-6">
        {tickets?.length && (
          <>
            <p className="text-gray-300 text-sm mb-4 text-center">
              <span className="text-lg font-bold text-white">Total Tickets:</span>
              <span className="ml-2 text-lg font-bold">{tickets.length}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {tickets.map((ticket, index) => (
                <p
                  key={index}
                  className="bg-[#161616] text-white font-semibold text-center px-4 py-3 rounded-lg border border-gray-800 shadow-md text-lg"
                >
                  #{ticket.toString()}
                </p>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CollectedTickets;
