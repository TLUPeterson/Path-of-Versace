'use client'
import { useEffect, useState } from 'react';
import pobInit from '../api/pobparse';

interface Pob {
  PathOfBuilding: JSON;
}


export default function Home() {
  const [data, setData] = useState<Pob | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data");
      const result = await pobInit();
      if (result === null) {
        console.log("NA");
      } else {
        setData(result);
      }
    };

    fetchData();
  }, []);
  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center mb-8">
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Loading...'}
      </div>
    </main>
  );
}