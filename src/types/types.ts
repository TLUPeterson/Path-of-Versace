
export interface Gear {
    tooltip: string;
    itemId?: string;
}

// types/item.d.ts
export interface Item {
    stats: string[];
    stats2: { [key: string]: string };
    implicits: string[];
    explicits: string[];
    Rarity?: string;
    bg_color?: string;
    baseType?: string;
    typeLine?: string;
    name?: string;
    line?: string;
    isFlask?: boolean;
    '@id'?: string;
    '#text'?: string;
    tooltip?: string;
}



export interface Items {
    ItemSet: any;
    forEach(arg0: (item: any) => void): unknown;
    Item: Item[];
}

export interface ItemInfo {
    icon?: string;
    isFlask?: boolean;
  }
  
export interface Stat {
    line: string;
    style: string;
  }


export interface ParsedItems {
    [key: string]: Item;
}

export interface Gears {
    [key: string]: Gear; 
    Weapon1: Gear;
    Weapon1Swap: Gear;
    Weapon2: Gear;
    Weapon2Swap: Gear;
    Helmet: Gear;
    Gloves: Gear;
    Boots: Gear;
    BodyArmour: Gear;
    Belt: Gear;
    Ring1: Gear;
    Ring2: Gear;
    Amulet: Gear;
    Flask1: Gear;
    Flask2: Gear;
    Flask3: Gear;
    Flask4: Gear;
    Flask5: Gear;
  }

export interface SkillSet {
    '@id': string;
}

export interface Skills {
    SkillSet: SkillSet | SkillSet[];
}

export interface PathOfBuilding {
    Gears: Gears;
    Config: any;
    TreeView: any;
    Calcs: any;
    Build: any;
    Import: any;
    Party: any;
    Tree: any;
    Notes: any;
    Items: Items;
    ParsedItems?: ParsedItems;
    Skills: Skills;
}

export interface Pob {
    PathOfBuilding: PathOfBuilding;
}

export interface Slot {
    '@itemId': string;
    '@name': string;
    '@itemPbURL': string;
  }
  
  export interface ItemSet {
    Slot: Slot[];
  }