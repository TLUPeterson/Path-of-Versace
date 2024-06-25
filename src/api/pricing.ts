//Unique armour - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueArmour
//Unique weapon - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueWeapon
//Unique accessory - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueAccessory
//Unique flask - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueFlask
//Unique jewel - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueJewel

// Pricing unique items through poeninja


export async function priceUnique(itemType: string, league: string, itemName: string){
    const url = `https://poe.ninja/api/data/itemoverview?league=${league}&type=${itemType}`;
    const data = await fetch(url)
    console.log(data);
}