'use client';

import { PageLayout } from '@/components/page-layout';
import { Typography } from '@/components/typography';
import Link from 'next/link';
import { NextPage } from 'next';
import { Button } from '@/shadcn/components/ui/button';

const NotFound: NextPage = () => {
  return (
    <PageLayout title="Page Not Found" description="This page could not be found" justify="center">
      <div className="flex flex-col justify-center items-center gap-8 text-center">
        <div className="mb-4">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="#555" strokeWidth="10" fill="none" />
            <line x1="60" y1="70" x2="80" y2="90" stroke="#555" strokeWidth="10" strokeLinecap="round" />
            <line x1="80" y1="70" x2="60" y2="90" stroke="#555" strokeWidth="10" strokeLinecap="round" />
            <path d="M60 130 Q100 170 140 130" stroke="#555" strokeWidth="10" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <Typography variant="h1">404 - Page Not Found</Typography>
        <Typography variant="paragraph">
          Oops! The page you are looking for does not exist or has been moved.
        </Typography>
        <Link href="/" passHref>
          <Button className="gap-2">Go Back to Homepage</Button>
        </Link>
      </div>
    </PageLayout>
  );
};

export default NotFound;
