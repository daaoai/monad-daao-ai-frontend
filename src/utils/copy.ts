import { toast } from '@/hooks/use-toast';
export const handleCopy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast({
      description: 'Mode copied to clipboard!',
      className: `bg-[#2ca585]`,
    });
  } catch (error) {
    console.log('error is ', error);
    toast({
      description: 'Failed to copy',
      className: ``,
    });
  }
};
