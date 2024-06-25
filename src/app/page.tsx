'use client'
import { useEffect, useState } from 'react';
import pobInit from '../api/pobparse';
import { PathOfBuilding, Item } from '@/types/types';
import { priceUnique } from '@/api/pricing';


export default function Home() {
  const [items, setItems] = useState<PathOfBuilding | null>(null);
  const price = priceUnique("UniqueArmour", "Necropolis", "Armour of the Dead");

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data");
      let result = await pobInit();
      console.log(result);
      if (result === null) {
        console.log("NA");
      } else {
        setItems(result);
      }
    };

    fetchData();
  }, []);

  if (!items || !items.ParsedItems) return <div>Loading...</div>;

  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Rarity</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type Line</th>
              <th className="px-4 py-2">Ex</th>
              <th className="px-4 py-2">Imp</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(items.ParsedItems).map(([id, item]: [string, Item]) => (
              <tr key={id} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{item['@id']}</td>
                <td className="px-4 py-2">{item.Rarity}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.typeLine}</td>
                <td className="px-4 py-2">{item.explicits}</td>
                <td className="px-4 py-2">{item.implicits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}