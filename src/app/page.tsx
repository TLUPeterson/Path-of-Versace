'use client'
import { useEffect } from 'react';
import pobInit from '../api/test';

export default function Home() {
  const data = pobInit();
  //console.log(data);
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">

      </div>
    </main>
  );
}