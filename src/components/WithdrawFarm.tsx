'use client';
import React, { useEffect, useState } from 'react';
import { XCircle, Loader } from 'lucide-react';
import useWithDraw from '@/hooks/farm/useWithdraw';
import { formatUnits, Hex, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { FarmPool } from '@/types/farm';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';

interface WithdrawProps {
  onClose: () => void;
  poolAddress: Hex;
  poolData: FarmPool;
}

const WithdrawFarms: React.FC<WithdrawProps> = ({ onClose, poolAddress, poolData }) => {
  const { withdraw, startWithdraw, getWithdrawalTime } = useWithDraw();
  const { address } = useAccount();
  const { toast } = useToast();

  const [withDrawEnable, setWithdrawEnable] = useState(false);
  const [withdrawAmount] = useState<number>(parseFloat(formatUnits(poolData.userInfo.stackedAmount, 18)));
  const [withdrawTimeLeft, setWithdrawTimeLeft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawTxnMessage, setWithdrawTxnMessage] = useState<{
    status: 'success' | 'error' | null;
    msg: string | null;
  }>({
    status: null,
    msg: null,
  });

  useEffect(() => {
    const fetchWithdrawalTime = async () => {
      if (address) {
        const timeLeft = await getWithdrawalTime({ address });
        if (timeLeft === 'Available Now') {
          setWithdrawEnable(true);
        } else if (timeLeft === 'Not Initiated') {
          setWithdrawEnable(false);
        } else {
          setWithdrawTimeLeft(timeLeft);
          setWithdrawEnable(false);
        }
      }
    };

    fetchWithdrawalTime();
  }, [address]);

  const handleWithdraw = async () => {
    setLoading(true);
    setWithdrawTxnMessage({
      status: null,
      msg: null,
    });

    toast({
      title: 'Processing Withdrawal...',
      description: `Withdrawing ${withdrawAmount} tokens.`,
      variant: 'default',
    });

    try {
      const receipt = await withdraw({
        poolAddress,
        amount: parseUnits(withdrawAmount.toString(), 18),
      });

      if (receipt?.status === 'success') {
        setWithdrawTxnMessage({
          status: 'success',
          msg: 'Withdrawal Successful',
        });
        toast({
          title: 'Withdrawal Successful ✅',
          description: `Your withdrawal of ${withdrawAmount} tokens is confirmed.`,
          variant: 'default',
        });

        setTimeout(
          () =>
            setWithdrawTxnMessage({
              status: null,
              msg: null,
            }),
          5000,
        );
      }
    } catch (error) {
      console.log(error, 'error');
      setWithdrawTxnMessage({
        status: 'error',
        msg: 'Withdrawal Failed',
      });
      toast({
        title: 'Withdrawal Failed ❌',
        description: 'An error occurred during withdrawal.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFlow = async () => {
    if (address) {
      if (withdrawTimeLeft && withdrawTimeLeft !== 'Available Now') {
        toast({
          title: 'Withdrawal Pending',
          description: `You can withdraw in ${withdrawTimeLeft}.`,
          variant: 'default',
        });
        return;
      }

      setLoading(true);
      setWithdrawTxnMessage({
        status: null,
        msg: null,
      });

      try {
        const txn = await startWithdraw();
        if (txn?.status === 'success') {
          setWithdrawEnable(true);
          setWithdrawTxnMessage({
            status: 'success',
            msg: 'Withdrawal Initiated Successfully',
          });
          toast({
            title: 'Withdrawal Initiated ✅',
            description: 'You can withdraw once the cooldown period is over.',
            variant: 'default',
          });

          setTimeout(
            () =>
              setWithdrawTxnMessage({
                status: null,
                msg: null,
              }),
            5000,
          );
        }
      } catch (error) {
        console.log(error, 'error');
        setWithdrawTxnMessage({
          status: 'error',
          msg: 'Withdrawal Initiated Failed',
        });
        toast({
          title: 'Withdrawal Failed ❌',
          description: 'An error occurred while starting withdrawal.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  console.log(formatUnits(poolData.userInfo.stackedAmount, 18), 'fghgvbhj');

  return (
    <Card className="w-full max-w-lg bg-gray-40 border border-gray-30 rounded-xl shadow-lg text-white">
      <CardHeader className="flex flex-row justify-between items-center px-6 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-white">Withdraw</CardTitle>
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
        <div className="flex flex-col gap-4">
          <p className="text-white">
            Tokens Staked: {formatUnits(poolData.userInfo.stackedAmount, 18)}
            CARTEL
          </p>

          {withdrawTimeLeft && <p className="text-yellow-400">Withdrawal available in: {withdrawTimeLeft}</p>}

          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white rounded-md bg-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={withDrawEnable ? handleWithdraw : handleWithdrawFlow}
            disabled={withdrawAmount === 0 || loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              'Withdraw'
            )}
          </button>

          {withdrawTxnMessage.status === 'success' && (
            <p className="text-green-500 text-center mt-2">{withdrawTxnMessage.msg} ✅</p>
          )}
          {withdrawTxnMessage.status === 'error' && (
            <p className="text-red-500 text-center mt-2">{withdrawTxnMessage.msg} ❌</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawFarms;
