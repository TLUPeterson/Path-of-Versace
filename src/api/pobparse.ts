import $ from "jquery";
import pako from "pako";
import xml2json from "./xml2json";


import { Gears, Item, ItemInfo, PathOfBuilding, Slot, Stat } from "@/types/types";

function basename(path: string): string | undefined {
  return path.split(/[\\/]/).pop();
}

function initItems()
{
  return {
    Weapon1: {'tooltip': 'Empty'},
    Weapon1Swap: {'tooltip': 'Empty'},
    Weapon2: {'tooltip': 'Empty'},
    Weapon2Swap: {'tooltip': 'Empty'},
    Helmet: {'tooltip': 'Empty'},
    Gloves: {'tooltip': 'Empty'},
    Boots: {'tooltip': 'Empty'},
    BodyArmour: {'tooltip': 'Empty'},
    Belt: {'tooltip': 'Empty'},
    Ring1: {'tooltip': 'Empty'},
    Ring2: {'tooltip': 'Empty'},
    Amulet: {'tooltip': 'Empty'},
    Flask1: {'tooltip': 'Empty'},
    Flask2: {'tooltip': 'Empty'},
    Flask3: {'tooltip': 'Empty'},
    Flask4: {'tooltip': 'Empty'},
    Flask5: {'tooltip': 'Empty'},
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
  refineItemSet(pob)
  refineItems(pob)
  addCategories(pob)
}

function refineSkills(pob: PathOfBuilding): void {
  if (pob.Skills.SkillSet && !Array.isArray(pob.Skills.SkillSet)) {
    pob.Skills.SkillSet = [pob.Skills.SkillSet];
  }
}


function refineItemSet(pob: PathOfBuilding): void {
  let itemSets = pob.Items.ItemSet[0].Slot;
  itemSets.forEach((item: Slot) => {

    if (item['@itemId'] === '0') {
      return;
    }
    const currrentItem = item['@name'].replace(/\s+/g, '');
    pob.Gears[currrentItem].itemId = item['@itemId'];

  });
}

function refineItems(pob: PathOfBuilding): void {
  let items: Item[] = pob.Items.Item;

  // Refine individual items
  let itemids: { [key: string]: Item } = {};
  items.forEach((val) => {
    if (val['#text']) {
      let tooltip = parseTooltip(val['#text']);

      parseForPriceinfo(val['#text']);
      Object.assign(val, tooltip);
    }
    if (val['@id']) {
      itemids[val['@id']] = val;
    }
  });
  pob.ParsedItems = itemids;
}

function parseForPriceinfo(text: string): string {
  const lines = text.split('\n');
  const processedLines = lines.map(line => line.replace(/\{(crafted|fractured)\}/g, '').trim());

  processedLines[0] = 'Item Class:'
  processedLines[1] = capitalizeFirstLetter(processedLines[1])

  // dont need unique actually
  switch (processedLines[1]){
      case 'Rarity: Rare':
      case 'Rarity: Unique':
          processedLines.splice(4, 0, '--------');
          break;
      case 'Rarity: Magic':
      case 'Rarity: Normal':
          processedLines.splice(3, 0, '--------');
          break;
  }
  //add dashes after implcits line

  console.log(processedLines)
  
  return text
}



function addCategories(pob: PathOfBuilding): void {
  let itemSets = pob.Items.ItemSet[0].Slot;
  itemSets.forEach((item: Slot) => {

    if (!pob.ParsedItems){
      return
    }
    const matchedItem = pob.ParsedItems[item['@itemId']];

    if (matchedItem) {
      matchedItem.category = item['@name']
    }

  });

  let itemSets2 = pob.Items.ItemSet[1].SocketIdURL;
  Object.entries(itemSets2).forEach(([key=1, item]) => {

    if (!pob.ParsedItems){
      return
    }
    pob.ParsedItems[key] = {
      ...pob.ParsedItems[key],
      category: 'Jewel'
    };

  });
}


function parseTooltip(text: string): Item {
  text = text.trim();
  const lines = text.split(/\r?\n/);
  const item: Item = {
    stats: [],
    stats2: {},
    implicits: [],
    explicits: [],
    category: ""
  };

  let line = lines.shift();
  if (!line) return item;

  const rarity = line.split(': ');
  const key = rarity[0] as keyof Item;
  if (rarity.length === 2 && key) {
    switch (key) {
      case 'stats':
      case 'implicits':
      case 'explicits':
        item[key] = rarity[1].split(',') as any;
        break;
      case 'stats2':
        // Assuming stats2 is an object and rarity[1] is a JSON string
        item[key] = JSON.parse(rarity[1]) as any;
        break;
      default:
        item[key] = rarity[1] as any;
    }
  }

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
  /*const itemInfo = searchItemInfo(item);
  if (itemInfo) {
    // Ignoring item icons as requested
    if (itemInfo.isFlask) {
      item.isFlask = itemInfo.isFlask;
    }
  }*/

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
        // If stat already exists, merge the new stat (if necessary)
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
    const prettyLine = modifierPretty(line, item);
    if (prettyLine) {
      item.implicits.push(prettyLine.line); // Ensure type compatibility
    }
  }

  lines.forEach((line) => {
    const prettyLine = modifierPretty(line, item);
    if (prettyLine) {
      item.explicits.push(prettyLine.line); // Ensure type compatibility
    }
  });

  return item;
}
// For poeprices
  function capitalizeFirstLetter(word: string): string {
    return word.replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

function isSelectedVariant(variant: string[], item: Item): boolean {
  if (
    item.stats2['Selected Variant'] &&
    variant.includes(item.stats2['Selected Variant'])
  ) {
    return true;
  }
  if (
    item.stats2['Selected Alt Variant'] &&
    variant.includes(item.stats2['Selected Alt Variant'])
  ) {
    return true;
  }
  return false;
}


function modifierPretty(line: string, item: Item): Stat | undefined {
  let stat: Stat = { line: line, style: '' };
  // remove {tags:}
  stat.line = stat.line.replace(/\{tags:.+?\}/, '');
  stat.line = stat.line.replace(/\{range:.+?\}/, '');

  let match: RegExpMatchArray | null;
  if ((match = line.match(/\{variant:(.+?)\}/))) {
    let variant = match[1].split(',');
    if (!isSelectedVariant(variant, item)) {
      return undefined;
    }
  }
  stat.line = stat.line.replace(/\{variant:.+?\}/, '');
  // keep larger value
  stat.line = stat.line.replace(/\(\d+\-(\d+)\)/g, '$1');
  stat.line = stat.line.replace(/\(\-?\d+\-(\d+)\)/g, '$1');

  if (line.indexOf('{crafted}') !== -1) {
    stat.line = stat.line.replace('{crafted}', '');
    stat.style = 'crafted';
  }
  if (line.indexOf('{fractured}') !== -1) {
    stat.line = stat.line.replace('{fractured}', '');
    stat.style = 'fractured';
  }
  if (line === 'Corrupted') {
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
    console.error('There has be  a problem with your fetch operation:', error);
    return null
  }
}
