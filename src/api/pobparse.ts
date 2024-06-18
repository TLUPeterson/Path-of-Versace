import $ from "jquery";
import pako from "pako";
import xml2json from "./xml2json";


import { Gears, Item, PathOfBuilding, Slot } from "@/types/types";


function basename(path: string): string | undefined {
  return path.split(/[\\/]/).pop();
}
function initItems()
{
  return {
    Weapon1: {'tooltip': 'Empty', 'ratio': '2/4'},
    Weapon1Swap: {'tooltip': 'Empty', 'ratio': '1/2'},
    Weapon2: {'tooltip': 'Empty', 'ratio': '2/4'},
    Weapon2Swap: {'tooltip': 'Empty', 'ratio': '1/2'},
    Helmet: {'tooltip': 'Empty', 'ratio': '2/2'},
    Gloves: {'tooltip': 'Empty', 'ratio': '2/2'},
    Boots: {'tooltip': 'Empty', 'ratio': '2/2'},
    BodyArmour: {'tooltip': 'Empty', 'ratio': '2/3'},
    Belt: {'tooltip': 'Empty', 'ratio': '2/1'},
    Ring1: {'tooltip': 'Empty', 'ratio': '1/1'},
    Ring2: {'tooltip': 'Empty', 'ratio': '1/1'},
    Amulet: {'tooltip': 'Empty', 'ratio': '1/1'},
    Flask1: {'tooltip': 'Empty', 'ratio': '1/2'},
    Flask2: {'tooltip': 'Empty', 'ratio': '1/2'},
    Flask3: {'tooltip': 'Empty', 'ratio': '1/2'},
    Flask4: {'tooltip': 'Empty', 'ratio': '1/2'},
    Flask5: {'tooltip': 'Empty', 'ratio': '1/2'},
  };
}

//dont need it later
function refine(pob: PathOfBuilding): void {

  delete pob.Build
  delete pob.Import
  delete pob.Party
  delete pob.Tree
  delete pob.Notes
  delete pob.Calcs
  delete pob.TreeView
  delete pob.Config
  pob.Gears = initItems();
  //console.log(typeof pob.Gears, pob.Gears)
  refineItemSet(pob)
  refineItems(pob)
  console.log(pob.Gears)
  //refineItems(pob)
}

function refineSkills(pob: PathOfBuilding): void {
  if (pob.Skills.SkillSet && !Array.isArray(pob.Skills.SkillSet)) {
    pob.Skills.SkillSet = [pob.Skills.SkillSet];
  }
}


function refineItemSet(pob: PathOfBuilding): void {
  let itemSets = pob.Items.ItemSet[0].Slot;
  itemSets.forEach((itemSet: Slot) => {

    if (itemSet['@itemId'] === '0') {
      return;
    }
    const currrentItem = itemSet['@name'].replace(/\s+/g, '');
    pob.Gears[currrentItem].itemId = itemSet['@itemId'];
  });
}

function refineItems(pob: PathOfBuilding): void {
  let items = pob.Items.Item;
  let gears = pob.Gears;
  //console.log(pob.Items)
  Object.entries(gears).forEach(([key, item]) => {
    //item['#text']
    //item['@id']
    //console.log(item.itemId);
    const tooltipText = items.find((i) => i['@id'] === item.itemId)?.['#text'];
    console.log(tooltipText);
    //item.tooltip = 

  })
}

function parseTooltip(text: string): Item {
  text = text.trim();
  const lines = text.split(/\r?\n/);
  const item: Item = {
    stats: [],
    stats2: {},
    implicits: [],
    explicits: [],
  };

  let line = lines.shift();
  if (!line) return item;

  const rarity = line.split(': ');
  item[rarity[0] as keyof Item] = rarity[1];
  item.bg_color = 'bg_' + item.Rarity;

  switch (item.Rarity) {
    case 'NORMAL':
    case 'MAGIC':
      item.baseType = item.typeLine = lines.shift() || '';
      break;
    case 'RARE':
    case 'UNIQUE':
    case 'RELIC':
      item.name = lines.shift() || '';
      item.baseType = item.typeLine = lines.shift() || '';
      item.line = 'doubleLine';
      break;
  }
  const itemInfo = searchItemInfo(item);
  if (itemInfo) {
    // Ignoring item icons as requested
    if (itemInfo.isFlask) {
      item.isFlask = itemInfo.isFlask;
    }
  }
  let implicits: number | undefined;
  const skipAttrs = new Set([
    'Unique ID',
    'League',
    'Item Level',
    'ArmourBasePercentile',
    'EvasionBasePercentile',
    'EnergyShieldBasePercentile',
    'Variant',
    'Selected Variant',
    'Has Alt Variant',
    'Selected Alt Variant',
    'Crafted',
    'Prefix',
    'Suffix',
    'Cluster Jewel Skill',
    'Cluster Jewel Node Count',
  ]);
  while (lines.length) {
    line = lines.shift()!;
    const stat = line.split(': ', 2);
    if (stat.length === 2) {
      if (item.stats2[stat[0]]) {
        // If stat already exists, merge the new stat
      } else {
        item.stats2[stat[0]] = stat[1];
      }
    }
    if (skipAttrs.has(stat[0])) {
      continue;
    }
    if (stat[0] === 'Quality' && stat[1] === '0') {
      continue;
    }
    if (stat[0] !== 'Implicits') {
      item.stats.push(line);
      continue;
    }
    implicits = parseInt(stat[1], 10);
    break;
  }

  for (let i = 0; i < (implicits || 0); i++) {
    line = lines.shift()!;
    line = modifierPretty(line, item);
    if (line) {
      item.implicits.push(line);
    }
  }

  lines.forEach((line) => {
    line = modifierPretty(line, item);
    if (line) {
      item.explicits.push(line);
    }
  });

  return item;
}

function searchItemInfo(item)
{
  switch(item.Rarity) {
    case 'NORMAL':
      return ITEMS[item.typeLine];
    case 'MAGIC':
      let found;
      $.each(ITEMS, function(itemName, itemInfo) {
        if (item.typeLine.indexOf(itemName) != -1) {
          found = itemInfo;
          return false; // =break;
        }
      });
      return found;
    case 'RARE':
      return ITEMS[item.typeLine];
    case 'UNIQUE':
    case 'RELIC':
      return ITEMS[item.name];
  }
}

function modifierPretty(line, item)
  {
    let stat = {line: line, style: ''};
    // remove {tags:}
    stat.line = stat.line.replace(/\{tags:.+?\}/, '');
    stat.line = stat.line.replace(/\{range:.+?\}/, '');
    //
    let match;
    if (match = line.match(/\{variant:(.+?)\}/)) {
      let variant = match[1].split(',');
      if (!isSelectedVariant(variant, item)) {
        return;
      }
    }
    stat.line = stat.line.replace(/\{variant:.+?\}/, '');
    // keep larger value
    stat.line = stat.line.replace(/\(\d+\-(\d+)\)/g, "$1");
    stat.line = stat.line.replace(/\(\-?\d+\-(\d+)\)/g, "$1");
    //
    if (line.indexOf('{crafted}') != -1) {
      stat.line = stat.line.replace('{crafted}', '');
      stat.style = 'crafted';
    }
    if (line.indexOf('{fractured}') != -1) {
      stat.line = stat.line.replace('{fractured}', '');
      stat.style = 'fractured';
    }
    if (line == 'Corrupted') {
      stat.style = 'corrupted';
    }
    return stat;
  }

function decodeRaw(raw: string): string {
  raw = raw.replaceAll('-', '+').replaceAll('_', '/');
  // Decode base64 (convert ascii to binary)
  const strData = atob(raw);
  // Convert binary string to character-number array
  const charData = strData.split('').map((x) => x.charCodeAt(0));
  // Turn number array into byte-array
  const binData = new Uint8Array(charData);
  return pako.inflate(binData, { to: 'string' }) as string;
}

function pobParse(raw: string): PathOfBuilding  {
  const xmlRaw = decodeRaw(raw);
  const xml = $.parseXML(xmlRaw);
  const jsonRaw = xml2json(xml, '');
  const json = JSON.parse(jsonRaw);
  const pob = json.PathOfBuilding;
  refine(pob)
  //console.log(pob);
  return pob;
}

export default async function pobInit(): Promise<PathOfBuilding | null> {
  const url = 'http://localhost:3001/pobdata';
  console.log(url);
  try {
    const response = await fetch(url, {
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const raw = await response.text();
    return pobParse(raw);
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return null
  }
}
