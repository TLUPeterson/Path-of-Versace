'use client'
import { use, useCallback, useEffect, useState } from 'react';
import Image from 'next/image'
import pobInit from '../api/pobparse';
import { PathOfBuilding, Item } from '@/types/types';
import { fetchItemPrice } from '@/api/pricing';
import { Checkbox } from '@/components/ui/checkbox';


export default function Home() {
  const [items, setItems] = useState<PathOfBuilding | null>(null);
  const [tradeData, setTradeData] = useState<any | null>(null);
  const [categoryData, setCategoryData] = useState<{ [key: string]: any }>({});
  const [itemPrices, setItemPrices] = useState<{ [key: string]: any }>({});
  const [selectedExplicits, setSelectedExplicits] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [selectedImplicits, setSelectedImplicits] = useState<{ [key: string]: { [key: string]: boolean } }>({});

  useEffect(() => {
    console.log(selectedImplicits);
  }, [selectedImplicits]);

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
        //console.log(item, item.explicits, typeof item.explicits);
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
    // Initialize selectedExplicits and selectedImplicits with all true values
    if (items && items.ParsedItems) {
      const initialSelectedExplicits: { [key: string]: { [key: string]: boolean } } = {};
      const initialSelectedImplicits: { [key: string]: { [key: string]: boolean } } = {};
      Object.entries(items.ParsedItems).forEach(([id, item]: [string, Item]) => {
        if (item.explicits) {
          initialSelectedExplicits[id] = {};
          Object.keys(item.explicits).forEach((key) => {
            initialSelectedExplicits[id][key] = true;
          });
        }
        if (item.implicits) {
          initialSelectedImplicits[id] = {};
          Object.keys(item.implicits).forEach((key) => {
            initialSelectedImplicits[id][key] = true;
          });
        }
      });
      setSelectedExplicits(initialSelectedExplicits);
      setSelectedImplicits(initialSelectedImplicits);
    }
  }, [items]);

  const handleExplicitCheckboxChange = (itemId: string, explicitKey: string) => {
    setSelectedExplicits((prevSelected) => ({
      ...prevSelected,
      [itemId]: {
        ...prevSelected[itemId],
        [explicitKey]: !prevSelected[itemId]?.[explicitKey]
      }
    }));
  };

  const handleImplicitCheckboxChange = (itemId: string, implicitKey: string) => {
    setSelectedImplicits((prevSelected) => ({
      ...prevSelected,
      [itemId]: {
        ...prevSelected[itemId],
        [implicitKey]: !prevSelected[itemId]?.[implicitKey]
      }
    }));
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
              <th className="px-4 py-2">Imp</th>
              <th className="px-4 py-2">Ex</th>
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
                <td className="px-4 py-2">
                {item.implicits && Object.entries(item.implicits).map(([key, implicit]) => (
                  <div id='implicits' key={key}>
                    <Checkbox
                      defaultChecked={true}
                      checked={selectedImplicits[id]?.[key] || false}
                      onCheckedChange={() => handleImplicitCheckboxChange(id, key)}
                    />
                    <label htmlFor="implicits">{implicit}</label>
                  </div>
                ))}
              </td>
                <td className="px-4 py-2">
                {item.explicits && Object.entries(item.explicits).map(([key, explicit]) => (
                  <div id='explicits' key={key}>
                    <Checkbox
                      defaultChecked={true}
                      checked={selectedExplicits[id]?.[key] || false}
                      onCheckedChange={() => handleExplicitCheckboxChange(id, key)}
                    />
                    <label htmlFor="explicits">{explicit}</label>
                  </div>
                ))}
              </td>
                <td className="px-4 py-2">{itemPrices[id] ? itemPrices[id].chaosValue : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}