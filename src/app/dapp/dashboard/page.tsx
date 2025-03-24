'use client';
import { PageLayout } from '@/components/page-layout';
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className="relative min-h-screen w-screen overflow-hidden">
        <div
          className={`relative flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-24`}
        >
          <div className="container mx-auto">
            <h1 className="text-left">Coming Soon</h1>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
