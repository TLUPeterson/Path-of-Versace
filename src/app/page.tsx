'use client'
import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import pobInit from '../api/pobparse';
import { PathOfBuilding, Item } from '@/types/types';
import { fetchItemPrice } from '@/api/pricing';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';


export default function Home() {

  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 mx-[10%]" >
      <div>
      Shieeet
      </div>
    </main>
  );
}