import $ from "jquery";
import pako from "pako";
import xml2json from "./xml2json";


import { Gears, PathOfBuilding } from "@/types/types";


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
  itemSets.forEach((itemSet: object) => {

  //console.log(itemSet);
  if (itemSet['@itemId'] == '0') {
    return;
  }
  console.log("new", itemSet)
  pob.Gears.itemSet['itemid'] = itemSet['@itemId'];
  });
}

function refineItems(pob: PathOfBuilding): void {
  let items = pob.Items.Item;
  console.log(pob.Items)
  items.forEach((item) => {
    item['#text']
    console.log(item);
  })
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
