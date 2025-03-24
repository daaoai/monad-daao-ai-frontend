'use client';

import type React from 'react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shadcn/components/ui/dialog';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';

const successMessage = 'You are whitelisted!';

interface CheckWhitelistModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CheckWaitlistModal: React.FC<CheckWhitelistModalProps> = ({ isOpen, setIsOpen }) => {
  const [modeAddress, setModeAddress] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const isValidModeAddress = (value: string) => {
    return value.length === 42 && value.startsWith('0x') && /^[0-9a-fA-F]+$/.test(value.slice(2));
  };

  const handleCheckwhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modeAddress.trim()) {
      setStatusMsg('Please enter your Mode address');
      return;
    }

    if (!isValidModeAddress(modeAddress)) {
      setStatusMsg('Please enter a valid Mode address');
      return;
    }

    try {
      const response = await fetch('/api/checkWaitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeAddress }),
      });
      if (!response.ok) {
        throw new Error('Failed to check whitelist');
      }
      const data = await response.json();
      if (data.exists) {
        setStatusMsg(successMessage); // Placeholder success message
      } else {
        setStatusMsg('You are not on the whitelist'); // Placeholder success message
      }
    } catch (error) {
      console.error('Error checking whitelist:', error);
      setStatusMsg('Something went wrong, please try again later');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-lg sm:max-w-[425px] w-[calc(100%-2rem)] bg-gradient-to-br from-black via-[#061023] to-[#0e070e] border-[#212121]">
        <DialogHeader>
          <DialogTitle className={`text-center text-xl sm:text-2xl`}>Check whitelist</DialogTitle>
          <DialogDescription className={`text-center text-[#d1ea48] text-lg sm:text-xl`}>
            Confirm you are in the whitelist
          </DialogDescription>
        </DialogHeader>
        <Card className="border-none bg-black/0">
          <CardContent className="pt-6">
            <form onSubmit={handleCheckwhitelist} className="space-y-4">
              {statusMsg && (
                <p
                  className={`text-center ${
                    statusMsg.includes(successMessage) ? 'text-green-500' : 'text-red-500'
                  } text-sm`}
                >
                  {statusMsg}
                </p>
              )}
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Mode address"
                  value={modeAddress}
                  onChange={(e) => setModeAddress(e.target.value)}
                  className="flex-grow bg-[#212121] text-[#9e9e9e] placeholder:text-[#9e9e9e] rounded-full"
                />
                <Button type="submit" className="rounded-full bg-white text-black hover:bg-gray-200">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <span>Check</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CheckWaitlistModal;
