'use client'
import { useEffect, useState } from 'react';
import pobInit from '../api/pobparse';
import { PathOfBuilding } from '@/types/types';


export default function Home() {
  const [data, setData] = useState<PathOfBuilding  | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data");
      let result = await pobInit();
      if (result === null) {
        console.log("NA");
      } else {
        result = result
        setData(result);
      }
    };

    fetchData();
  }, []);
  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        {/* {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Loading...'} */}
      </div>
    </main>
  );
}