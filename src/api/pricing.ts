//Unique armour - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueArmour
//Unique weapon - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueWeapon
//Unique accessory - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueAccessory
//Unique flask - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueFlask
//Unique jewel - https://poe.ninja/api/data/itemoverview?league=Necropolis&type=UniqueJewel

// Pricing unique items through poeninja

export const fetchItemPrice = async (itemType: string, league: string) => {
    const response = await fetch(`http://localhost:3001/pricing?itemType=${itemType}&league=${league}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  };