'use client'
import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import pobInit from '../api/pobparse';
import { PathOfBuilding, Item } from '@/types/types';
import { fetchItemPrice } from '@/api/pricing';


export default function Home() {
  const [items, setItems] = useState<PathOfBuilding | null>(null);
  const [tradeData, setTradeData] = useState<any | null>(null);
  const [categoryData, setCategoryData] = useState<{ [key: string]: any }>({});
  const [itemPrices, setItemPrices] = useState<{ [key: string]: any }>({});

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

  useEffect(() => {
    const fetchTradeData = async () => {
      console.log('Fetching trade data');
      try {
        const response = await fetch('http://localhost:3001/statictradedata');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTradeData(data.result);
      } catch (error) {
        console.error('Error fetching trade data:', error);
      }
    };

    fetchTradeData();
  }, []);

  const fetchCategoryData = async () => {
    console.log('Fetching category data');
    const itemTypes = ['UniqueArmour', 'UniqueWeapon', 'UniqueAccessory', 'UniqueFlask', 'UniqueJewel'];

    const fetchedData: { [key: string]: any } = {};
    await Promise.all(
      itemTypes.map(async (itemType) => {
        if (!categoryData[itemType]) {
          const categoryPriceData = await fetchItemPrice(itemType, 'Necropolis');
          fetchedData[itemType] = categoryPriceData;
        }
      })
    );

    setCategoryData((prevData) => ({ ...prevData, ...fetchedData }));
  };

  function handleRefetch() {
    setCategoryData({});
    fetchCategoryData();
  }

  const fetchPrices = async () => {
    if (!items || !items.ParsedItems || !tradeData) return;

    const prices: { [key: string]: any } = {};

    await Promise.all(
      Object.entries(items.ParsedItems).map(async ([id, item]: [string, Item]) => {
        if (item.Rarity === 'UNIQUE') {
          let category = null;

          for (const cat of tradeData) {
            if (cat.entries.some((entry: any) => entry.name === item.name)) {
              category = cat.id;
              break;
            }
          }

          if (category) {
            const itemType = getItemTypeFromCategory(category);

            const itemPriceData = categoryData[itemType]?.lines.find((entry: any) => entry.name === item.name);
            prices[id] = itemPriceData || { chaosValue: 'N/A' };
          }
        }
      })
    );

    setItemPrices(prices);
  };


  const getItemTypeFromCategory = (category: string): string => {
    switch (category) {
      case 'accessories':
        return 'UniqueAccessory';
      case 'armour':
        return 'UniqueArmour';
      case 'weapons':
        return 'UniqueWeapon';
      case 'flasks':
        return 'UniqueFlask';
      case 'jewels':
        return 'UniqueJewel';
      default:
        return 'Unknown';
    }
  };

  useEffect(() => {
    fetchCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items || !items.ParsedItems) return <div>Loading...</div>;

  
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      <button className='my-10' onClick={handleRefetch}>Refetch</button>
      <button onClick={fetchPrices}>Fetch Prices</button>
      <div className="overflow-x-auto mr-[10%]">
        <table className="min-w-full bg-white dark:bg-gray-800 ">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Rarity</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type Line</th>
              <th className="px-4 py-2">Ex</th>
              <th className="px-4 py-2">Imp</th>
              <th className="px-4 py-2">Price (Chaos)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(items.ParsedItems).map(([id, item]: [string, Item]) => (
              <tr key={id} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{item['@id']}
                {/* <Image src={itemPrices[id]?itemPrices[id].icon:''} alt={item.name?item.name:''} width={40} height={40} /> */}
                </td>
                <td className="px-4 py-2">{item.Rarity}</td>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.typeLine}</td>
                <td className="px-4 py-2">{item.explicits}</td>
                <td className="px-4 py-2">{item.implicits}</td>
                <td className="px-4 py-2">{itemPrices[id] ? itemPrices[id].chaosValue : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}