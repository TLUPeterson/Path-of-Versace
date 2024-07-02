//Unique armour - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueArmour
//Unique weapon - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueWeapon
//Unique accessory - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueAccessory
//Unique flask - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueFlask
//Unique jewel - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueJewel

import { Item, PathOfBuilding } from "@/types/types";

// Pricing unique items through poeninja

export const fetchItemPrice = async (itemType: string, league: string) => {
    const response = await fetch(`http://localhost:3001/pricing?itemType=${itemType}&league=${league}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  };

export const fetchItemPriceFromTrade = async (item: Item) => {
  // Encode itemText as base64
  const itemText = item["#text"] as string;
  const iteminfo = querystring({
    l: 'Necropolis',
    i: utf8ToBase64(transformItemText(itemText)),
  });
  //console.log(iteminfo);

  const response = await fetch(`http://localhost:3001/poeprice?iteminfo=${encodeURIComponent(iteminfo)}`);
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  return response.json();
}

function utf8ToBase64 (value: string) {
  return btoa(unescape(encodeURIComponent(value)))
}

function querystring (q: Record<string, any>) {
  return Object.entries(q)
    .map(pair => pair.map(encodeURIComponent).join('='))
    .join('&')
}

function transformItemText (rawText: string) {
  // this may not account for all cases
  return rawText
    .replace(/(?<=\d)(\([^)]+\))/gm, '')
    .replace(/\{[^}]*\}/gm, '')
}