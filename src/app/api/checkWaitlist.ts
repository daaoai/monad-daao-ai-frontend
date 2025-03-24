import { NextApiRequest, NextApiResponse } from 'next';
import { ModeAddresses } from '../../utils/data';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { modeAddress }: { modeAddress: string } = req.body;
    const exists = ModeAddresses.includes(modeAddress.toLowerCase());
    res.status(200).json({ exists });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
