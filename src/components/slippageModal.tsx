import React from 'react';
import { XCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle } from '@/shadcn/components/ui/card';

interface SlippageModal {
  onClose: () => void;
  setSlippageTolerance: (value: string) => void;
}

const SlippageModal: React.FC<SlippageModal> = ({ onClose, setSlippageTolerance }) => {
  return (
    <Card className="w-full max-w-lg bg-gray-40 border border-gray-30 rounded-xl shadow-lg text-white">
      <CardHeader className="flex flex-row justify-between items-center px-6 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-white">Slippage Tolerance</CardTitle>
        </div>
        <button
          className="text-gray-10 hover:text-white transition-all text-sm"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <XCircle size={22} />
        </button>
      </CardHeader>
      <div>
        <p>Higher slippage transactions are more likely to go through, but you might get a worse quote.</p>
        <div className="flex w-full gap-6 items-center justify-center my-6">
          <button
            onClick={() => {
              setSlippageTolerance('0.50');
              onClose();
            }}
            className="bg-black border border-gray-40 rounded-md p-2 text-sm w-16"
          >
            0.50%
          </button>
          <button
            onClick={() => {
              setSlippageTolerance('1');
              onClose();
            }}
            className="bg-black border border-gray-40 rounded-md p-2 text-sm w-16"
          >
            1%
          </button>
          <button
            onClick={() => {
              setSlippageTolerance('2.50');
              onClose();
            }}
            className="bg-black border border-gray-40 rounded-md p-2 text-sm w-16"
          >
            2.50%
          </button>
          <button
            onClick={() => {
              setSlippageTolerance('5.00');
              onClose();
            }}
            className="bg-black border border-gray-40 rounded-md p-2 text-sm w-16"
          >
            5.00%
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SlippageModal;
