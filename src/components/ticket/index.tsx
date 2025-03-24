'use client';
import React, { useState, useEffect } from 'react';
import useGetTicketPrice from '@/hooks/useTicket';
import useGetBalance from '@/hooks/useGetBalance';
import { formatUnits } from 'viem';
import useBuyTickets from '@/hooks/useBuyTickets';
import { Wallet, XCircle, Info } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { TICKET_DESCRIPTION } from '@/content/ticketDescription';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shadcn/components/ui/tooltip';
import { Button } from '@/shadcn/components/ui/button';
import { Label } from '@/shadcn/components/ui/label';
import { Input } from '@/shadcn/components/ui/input';
import { Alert, AlertDescription } from '@/shadcn/components/ui/alert';

const MAX_TICKETS = 25;

interface TicketPurchaseProps {
  onClose: () => void;
  onTicketsUpdated: () => void;
}

const TicketPurchase: React.FC<TicketPurchaseProps> = ({ onClose, onTicketsUpdated }) => {
  const [tickets, setTickets] = useState(0);
  const [nftId, setNftId] = useState('');
  const [localError, setLocalError] = useState('');

  const { ticketPrice } = useGetTicketPrice();
  const { symbol, decimals, balance } = useGetBalance();
  const { buyTickets, mintedData, isLoading, isSuccess } = useBuyTickets();
  const { toast } = useToast();

  // Validate ticket count
  useEffect(() => {
    if (tickets < 1) {
      setLocalError('Please select at least 1 ticket');
    } else if (tickets > MAX_TICKETS) {
      setLocalError(`You can select a maximum of ${MAX_TICKETS} tickets`);
    } else {
      setLocalError('');
    }
  }, [tickets]);

  // Update NFT ID when mintedData is available
  useEffect(() => {
    if (mintedData) {
      setNftId(mintedData.tokenId.toString());
      onTicketsUpdated(); // Call the parent's refetch function
    }
  }, [mintedData]);

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0;
    setTickets(value);
  };

  const isButtonDisabled = tickets < 1 || tickets > MAX_TICKETS || isLoading;
  const pricePerTicket = formatUnits((ticketPrice ?? 0) as bigint, decimals ?? 18);
  const totalTicketAmount = tickets * Number(pricePerTicket);

  const handleBuyTickets = async () => {
    if (Number(formatUnits((balance ?? 0) as bigint, decimals ?? 18)) < totalTicketAmount) {
      toast({
        title: 'Insufficient Balance',
        variant: 'destructive',
      });
      return;
    }
    await buyTickets({
      ticketCount: tickets,
      ticketPrice: Number(ticketPrice),
    });
  };

  return (
    <Card className="w-full max-w-lg bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl shadow-lg text-white">
      {!isSuccess ? (
        <>
          <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-white">Whitelist Lottery Tickets</CardTitle>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Info size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-white bg-gray-800 p-2">
                    <div className="whitespace-pre-wrap leading-relaxed">{TICKET_DESCRIPTION}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="tickets" className="text-sm font-medium text-gray-300">
                    Number of Tickets (Max {MAX_TICKETS})
                  </Label>
                  <div className="flex gap-2 items-center text-gray-400">
                    <p className="text-xs font-semibold">
                      Balance {Number(formatUnits((balance ?? 0) as bigint, decimals ?? 18)).toFixed(2)} CARTEL
                    </p>
                    <Wallet size={14} />
                  </div>
                </div>
                <Input
                  id="tickets"
                  type="number"
                  min="1"
                  max={MAX_TICKETS}
                  value={tickets}
                  onChange={handleTicketChange}
                  className="w-full px-4 py-2 border border-gray-700 rounded-md bg-[#161616] text-white placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-800 transition-all"
                />
              </div>

              {localError && (
                <Alert variant="destructive" className="bg-red-700 text-white text-sm px-4 py-2 rounded-lg">
                  <AlertDescription>{localError}</AlertDescription>
                </Alert>
              )}
              <p className="text-gray-300">
                Price per Ticket:{' '}
                <span className="font-semibold text-white">
                  {pricePerTicket} {symbol}
                </span>
              </p>
              <p className="text-lg font-semibold text-white">
                Total CARTEL Needed: {totalTicketAmount} {symbol}
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-6">
            <Button
              className="w-full bg-blue-950 text-white font-semibold rounded-md py-3 transition-all"
              onClick={handleBuyTickets}
              disabled={isButtonDisabled}
            >
              {isLoading ? 'Processing...' : 'Burn & Buy Tickets'}
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="flex flex-row justify-between items-center px-6 py-4">
            <CardTitle className="text-lg font-semibold text-white">Purchase Successful!</CardTitle>
            <Button variant="ghost" className="text-gray-400 hover:text-white transition-all" onClick={onClose}>
              <XCircle size={22} />
            </Button>
          </CardHeader>

          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <p className="text-2xl font-bold text-white">NFT ID: {nftId}</p>
              <p className="text-lg text-gray-300">Thank you for your purchase!</p>
              <p className="text-lg font-semibold text-gray-400">Tickets Bought: {tickets}</p>
              <p className="text-lg font-semibold text-white">
                Tokens Burned: {totalTicketAmount} {symbol}
              </p>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default TicketPurchase;
