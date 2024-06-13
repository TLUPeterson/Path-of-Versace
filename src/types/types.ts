
export interface Gear {
    tooltip: string;
    ratio: string;
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

export interface ParsedItems {
    [key: string]: Item;
}

export interface Gears {
    [key: string]: Gear;
}

export interface SkillSet {
    '@id': string;
}

export interface Skills {
    SkillSet: SkillSet | SkillSet[];
}

export interface PathOfBuilding {
    Gears: { Weapon1: { tooltip: string; ratio: string; }; Weapon1Swap: { tooltip: string; ratio: string; }; Weapon2: { tooltip: string; ratio: string; }; Weapon2Swap: { tooltip: string; ratio: string; }; Helmet: { tooltip: string; ratio: string; }; Gloves: { tooltip: string; ratio: string; }; Boots: { tooltip: string; ratio: string; }; BodyArmour: { tooltip: string; ratio: string; }; Belt: { tooltip: string; ratio: string; }; Ring1: { tooltip: string; ratio: string; }; Ring2: { tooltip: string; ratio: string; }; Amulet: { tooltip: string; ratio: string; }; Flask1: { tooltip: string; ratio: string; }; Flask2: { tooltip: string; ratio: string; }; Flask3: { tooltip: string; ratio: string; }; Flask4: { tooltip: string; ratio: string; }; Flask5: { tooltip: string; ratio: string; }; };
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