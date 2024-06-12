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
import React from "react";

interface Item {
  id: number;
  category: string;
  name: string;
  price?: number;
  imageUrl?: string;
  bought?: boolean;
  url?: string;
}

const defaultItems: { [key: string]: Partial<Item> } = {
  Helmet: {},
  Weapon: {},
  Body: {},
  Amulet: {},
  Rings: {},
  Boots: {},
  Gloves: {},
  Belt: {},
  Jewels: {},
  Flasks: {},
};

const categories = Object.keys(defaultItems);


export default function BuilderPage() {
  const [items, setItems] = React.useState<{ [key: string]: Partial<Item> }>(
    defaultItems
  );

  const addItem = (category: string, newItem: Partial<Item>) => {
    setItems((prevItems) => ({
      ...prevItems,
      [category]: { ...newItem, id: new Date().getTime() },
    }));
  };

  const removeItem = (category: string) => {
    setItems((prevItems) => ({
      ...prevItems,
      [category]: {},
    }));
  };

  const totalPrice = React.useMemo(() => {
    return categories.reduce((total, category) => {
      return total + (items[category].price || 0);
    }, 0);
  }, [items]);
  return (
<div className="p-4 mx-[15%]">
      <div className="mb-8 mr-[70%] flex">
        <Input className="mr-4" placeholder="pobb.in link">
        </Input>
        <Button>
          Add
        </Button>
      </div>

      <Table className="w-full">
        <TableCaption>Path of Exile Item Tracker</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-customblack">Category</TableHead>
            <TableHead className="text-customblack">Item</TableHead>
            <TableHead className="text-customblack">Price</TableHead>
            <TableHead className="text-right text-customblack">State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category}>
              <TableCell className="font-medium text-customblue font-bold">
                <a href={`#${category}`}>{category}</a>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {items[category].imageUrl ? (
                    <img
                      src={items[category].imageUrl}
                      alt={items[category].name}
                      className="h-12"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200" />
                  )}
                  <span>{items[category].name || `No ${category} selected`}</span>
                </div>
              </TableCell>
              <TableCell>
                {items[category].price !== undefined
                  ? `$${items[category].price.toFixed(2)}`
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                {items[category].name ? (
                  <>
                    <button
                      className="bg-customorange text-customwhite hover:text-customwhite hover:bg-customblue px-2 py-1 rounded"
                      onClick={() => removeItem(category)}
                    >
                      Remove
                    </button>
                    <button className="ml-2 bg-customgreen hover:bg-customblue px-2 py-1 rounded">
                      <a
                        href={items[category].url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-customwhite"
                      >
                        Buy
                      </a>
                    </button>
                  </>
                ) : (
                  <button className="bg-customgreen text-customwhite hover:text-customwhite hover:bg-customblue px-2 py-1 rounded">
                    <a href={`#add-${category}`}>Add {category}</a>
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2}></TableCell>
            <TableCell className="text-right text-customgreen font-bold text-2xl">
              Total: ${totalPrice.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
