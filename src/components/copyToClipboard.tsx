import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shadcn/components/ui/tooltip';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

interface ClickToCopyProps {
  copyText: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
};

const ClickToCopy: React.FC<ClickToCopyProps> = ({ copyText, className, size = 'xs' }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleCopyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    copyToClipboard(copyText);
    setCopied(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip open={copied}>
        <TooltipTrigger asChild>
          <div className={clsx('cursor-pointer flex items-center', className)} onClick={handleCopyClick}>
            {copied ? <Check size={sizeMap[size]} /> : <Copy size={sizeMap[size]} />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>Copied!</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClickToCopy;
