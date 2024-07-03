'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import Image from 'next/image';
import React, { useEffect, useState, useMemo } from "react";
import { Item, PathOfBuilding } from '@/types/types';
import { fetchItemPrice, fetchItemPriceFromTrade } from "@/api/pricing";
import pobInit from "@/api/pobparse";
import { Checkbox } from "@/components/ui/checkbox";


export default function BuilderPage() {
  const [pobbLink, setpobbLink] = useState('');
  const [items, setItems] = useState<PathOfBuilding | null>(null);
  const [currencyPrice, setCurrencyPrice] = useState<any | null>(null);
  const [divineValue, setDivineValue] = useState<number | null>(100);
  const [tradeData, setTradeData] = useState<any | null>(null);
  const [categoryData, setCategoryData] = useState<{ [key: string]: any }>({});
  const [itemPrices, setItemPrices] = useState<{ [key: string]: any }>({});
  const [selectedExplicits, setSelectedExplicits] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [selectedImplicits, setSelectedImplicits] = useState<{ [key: string]: { [key: string]: boolean } }>({});

  useEffect(() => {
    console.log(items);
  }, [items]);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      console.log('Fetching currency data');
      try {
        const response = await fetch('http://localhost:3001/currency');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCurrencyPrice(data);
        console.log(data.lines);

        for (const item of data.lines) {
          if(item.currencyTypeName === 'Divine Orb'){
            setDivineValue(item.receive.value)
          }
        }
      } catch (error) {
        console.error('Error fetching currency data:', error);
      }
    };

    fetchCurrencyData();
  }, []);

  // POB data
  const fetchData = async () => {
    const pobbCode = pobbLink.trim().match(/(?:https:\/\/)?(?:pobb\.in\/)?([a-zA-Z0-9-]+)/)?.[1];
    if (!pobbCode) {
      console.log("Invalid pobb.in link or code");
      return;
    }
    let result = await pobInit(pobbCode);
    if (result === null) {
      console.log("NA");
    } else {
      setItemPrices({});
      setCategoryData({});
      fetchCategoryData();
      setItems(result);
    }
  };

  // Static trade data containing items and their categories
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


  // Get category item data prices from poe.ninja
  const fetchCategoryData = async () => {
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
    setItemPrices({});
    setCategoryData({});
    fetchCategoryData();
  }

  // Fetch item prices from poe.ninja
  const fetchPrices = async () => {
    if (!items || !items.ParsedItems || !tradeData) return;

    const prices: { [key: string]: any } = {};

    await Promise.all(
      Object.entries(items.ParsedItems).map(async ([id, item]: [string, Item]) => {
        //console.log(item, item.explicits, typeof item.explicits);
        console.log('item price loop', id);
        if (item.Rarity === 'UNIQUE') {
          console.log('unique item', item);
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
        }else if (item.Rarity === 'RARE' || item.Rarity === 'MAGIC') {
          if (item["#text"]) {
            const itemPriceFromPoeprice = await fetchItemPriceFromTrade(item);
            prices[id] = {}
            // make all prices to be in uniform (chaos value)
            if (itemPriceFromPoeprice.currency === 'divine'){
              prices[id].chaosValue = Math.round(itemPriceFromPoeprice.min*divineValue*100)/100 || 'NA';
            }else{
              prices[id].chaosValue = Math.round(itemPriceFromPoeprice.min*100)/100 || 'NA';
            }
            //console.log(prices[id]);

          }
        }
      })
    );
    console.log(prices);
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


  const totalChaosValue = useMemo(() => {
    return Object.values(itemPrices).reduce((total, item) => {
      const value = typeof item.chaosValue === 'number' ? item.chaosValue : 0;
      return total + value;
    }, 0);
  }, [itemPrices]);
  
  return (
<div className="p-4 mx-[15%]">
      <div className="mb-8 mr-[70%] flex">
      <Input
        className="mr-4"
        placeholder="pobb.in link"
        value={pobbLink}
        onChange={(e) => setpobbLink(e.target.value)}
      />
        <Button onClick={fetchData}>
          Add
        </Button>
      </div>
      <div>Div price: {divineValue}</div>
      <div>Total Chaos: {totalChaosValue}</div>
      <div>Total Div: {totalChaosValue/divineValue}</div>
      <div>
        <Button className='my-10 mr-4' onClick={handleRefetch}>Refetch</Button>
        <Button onClick={fetchPrices}>Fetch Prices</Button>
      </div>

      <Table className="w-full">
        <TableCaption>Path of Exile Item Tracker</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-customblack">Category</TableHead>
            <TableHead className="text-customblack">Rarity</TableHead>
            <TableHead className="text-customblack">Item Name</TableHead>
            <TableHead className="text-customblack">Type Line</TableHead>
            <TableHead className="text-customblack">Imp</TableHead>
            <TableHead className="text-customblack">Exp</TableHead>
            <TableHead className="text-customblack">Price</TableHead>
            <TableHead className="text-right text-customblack">State</TableHead>
          </TableRow>
        </TableHeader>
        {items && items.ParsedItems && (
        <TableBody>
            {Object.entries(items.ParsedItems).map(([id, item]: [string, Item]) => (
              <TableRow key={id} className={`border-t dark:border-gray-700 hover:bg-gray-700  
              ${item.Rarity === 'UNIQUE' ? 'bg-amber-950 text-orange-500' : ''}
              ${item.Rarity === 'RARE' ? 'bg-yellow-700 text-yellow-200' : ''}
              ${item.Rarity === 'MAGIC' ? 'bg-blue-950 text-blue-200' : ''}
              
              `}>
                
                
                <TableCell className="px-4 py-2 ">{item.category}
                {/* <Image src={itemPrices[id]?itemPrices[id].icon:''} alt={item.name?item.name:''} width={40} height={40} /> */}
                </TableCell>
                <TableCell className="px-4 py-2">{item.Rarity}</TableCell>
                <TableCell className="px-4 py-2">{item.name}</TableCell>
                <TableCell className="px-4 py-2">{item.typeLine}</TableCell>
                <TableCell className="px-4 py-2">
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
              </TableCell>
                <TableCell className="px-4 py-2">
                {item.explicits && Object.entries(item.explicits).map(([key, explicit]) => (
                  <div id='explicits' key={key}>
                    <Checkbox
                      className='bg-white'
                      defaultChecked={true}
                      checked={selectedExplicits[id]?.[key] || false}
                      onCheckedChange={() => handleExplicitCheckboxChange(id, key)}
                    />
                    <label htmlFor="explicits" className='pl-2'>{explicit}</label>
                  </div>
                ))}
              </TableCell>
                <TableCell className="px-4 py-2">{itemPrices[id] ? itemPrices[id].chaosValue : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
