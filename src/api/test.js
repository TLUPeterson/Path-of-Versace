import $ from "jquery";
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const pako = require('pako');

var GEM_COLORS = {
  1: 'gem_red',
  2: 'gem_green',
  3: 'gem_blue'
};

var CLASS_ICONS = {
  'Ranger': 'IconDex.webp',
  'Deadeye': 'IconDex_Deadeye.webp',
  'Pathfinder': 'IconDex_Pathfinder.webp',
  'Raider': 'IconDex_Raider.webp',
  'Shadow': 'IconDexInt.webp',
  'Assassin': 'IconDexInt_Assassin.webp',
  'Saboteur': 'IconDexInt_Saboteur.webp',
  'Trickster': 'IconDexInt_Trickster.webp',
  'Witch': 'IconInt.webp',
  'Elementalist': 'IconInt_Elementalist.webp',
  'Necromancer': 'IconInt_Necromancer.webp',
  'Occultist': 'IconInt_Occultist.webp',
  'Marauder': 'IconStr.webp',
  'Berserker': 'IconStr_Berserker.webp',
  'Chieftain': 'IconStr_Chieftain.webp',
  'Juggernaut': 'IconStr_Juggernaut.webp',
  'Duelist': 'IconStrDex.webp',
  'Champion': 'IconStrDex_Champion.webp',
  'Gladiator': 'IconStrDex_Gladiator.webp',
  'Slayer': 'IconStrDex_Slayer.webp',
  'Scion': 'IconStrDexInt.webp',
  'Ascendant': 'IconStrDexInt_Ascendant.webp',
  'Templar': 'IconStrInt.webp',
  'Guardian': 'IconStrInt_Guardian.webp',
  'Hierophant': 'IconStrInt_Hierophant.webp',
  'Inquisitor': 'IconStrInt_Inquisitor.webp',
};

function getPageLang()
{
  return 'us';
}

function nl2br (str, replaceMode, isXhtml) {
  var breakTag = (isXhtml) ? '<br />' : '<br>';
  var replaceStr = (replaceMode) ? '$1'+ breakTag : '$1'+ breakTag +'$2';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
}

function basename(path)
{
  return path.split(/[\\/]/).pop();
}

function refine(pob)
{
  refineStats();

  refineClassIcon(pob);
  //refineSkills(pob);

  //refineOverrides(pob);

  //refineItems(pob);
  refineGears(pob);
  refineJewels(pob);
}

function getPassiveUrl(lang)
{
  let langs = {
    'pt': 'br',
    'sp': 'es',
  };
  if (lang2 = langs[lang]) {
    lang = lang2;
  }
  switch(lang) {
    case 'tw': return 'https://web.poe.garena.tw/';
    case 'kr': return 'https://poe.game.daum.net/';
    case 'cn': return 'https://poe.game.qq.com/';
    case 'us': return 'https://www.pathofexile.com/';
    default: return 'https://'+lang+'.pathofexile.com/';
  }
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

function explode(separator, str)
{
  let index = str.indexOf(separator);
  if (index == -1) {
    return [str];
  }
  return [str.slice(0, index), str.slice(index +1).trim()];
}

String.prototype.explode = function (separator, limit)
{
  const array = this.split(separator);
  if (limit !== undefined && array.length >= limit)
  {
    array.push(array.splice(limit - 1).join(separator));
  }
  return array;
};


function isSelectedVariant(variant, item)
{
  if (item.stats2['Selected Variant'] && $.inArray(item.stats2['Selected Variant'], variant) != -1) {
    return true;
  }
  if (item.stats2['Selected Alt Variant'] && $.inArray(item.stats2['Selected Alt Variant'], variant) != -1) {
    return true;
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

function refineStats()
{
  if ("us" == 'us') {
    return;
  }
  $.each(TRADE_DATA_STATS, function(us, tr) {
    let us2 = reduceStr(us);
    TRADE_DATA_STATS[us2] = tr;
    if (us2.indexOf('(') != -1) {
      let us3 = us2.replace(/\(.+?\)/, '');
      TRADE_DATA_STATS[us3] = tr;
    }
  });
}

function reduceStr(str)
{
  return str.replaceAll('#', '').replaceAll(' ', '').replaceAll('+', '').replaceAll('-', '').replaceAll(/[0-9]/g, '').replace('.', '');
}

function translateItem(val)
{
  if (getPageLang() == 'us') {
    return val;
  }
  if ((tr = ITEMS[val]) && tr.tr) {
    return tr.tr;
  }
  return val;
}

function translateItemAttr(val)
{
  if (getPageLang() == 'us') {
    return val;
  }
  if (tr = ITEM_DISPLAY[val]) {
    return tr;
  }
  return val;
}

function translateStat(val)
{
  if (getPageLang() == 'us') {
    return val;
  }
  let val2 = reduceStr(val);
  let tr = '';
  if (tr = TRADE_DATA_STATS[val2]) {
    let numbers = val.match(/\d+(\.\d+)?/g);
    let sharp = tr.match(/#/g);
    if (numbers && sharp && numbers.length == sharp.length && numbers.length >= 1) {
      $.each(numbers, function(k, n) {
        tr = tr.replace('#', n);
      });
    }
    return tr+'<div class="default fst-italic">'+val+'</div>';
  }
  return val;
}

function translateIcon(val)
{
  let icons = {
    'Hunter Item': 'image/item/popup/hunter-symbol.webp',
    'Warlord Item': 'image/item/popup/warlord-symbol.webp',
    'Shaper Item': 'image/item/popup/shaper-symbol.webp',
    'Elder Item': 'image/item/popup/elder-symbol.webp',
    'Crusader Item': 'image/item/popup/crusader-symbol.webp',
    'Redeemer Item': 'image/item/popup/redeemer-symbol.webp',
  };
  if (icon = icons[val]) {
    return `<img src="https://cdn.poedb.tw/${icon}"/>`;
  }
  return val;
}

function sortJewels(pob)
{
  let scores = {
    'Large Cluster Jewel': 20,
    'Medium Cluster Jewel': 19,
    'Small Cluster Jewel': 18,
    'Prismatic Jewel': 17,
    'Crimson Jewel': 16,
    'Viridian Jewel': 15,
    'Cobalt Jewel': 14,
    'Timeless Jewel': 13,
    'Ursine Charm': 12,
    'Lupine Charm': 11,
    'Corvine Charm': 10,
  };
  pob.Jewels.sort((a, b) => {
    let av = 0, bv = 0;
    if (score = scores[a.baseType]) {
      av = score;
    }
    if (score = scores[b.baseType]) {
      bv = score;
    }
    return bv - av;
  });

}

function refineJewels(pob)
{
  pob.Jewels = [];
  if (!pob.Tree.CurrentSpec.Sockets) {
    return;
  }
  if (pob.Tree.CurrentSpec.Sockets.Socket['@nodeId']) {
      pob.Tree.CurrentSpec.Sockets.Socket = [pob.Tree.CurrentSpec.Sockets.Socket];
  }
  for (let k = 0; k < pob.Tree.CurrentSpec.Sockets.Socket.length; k++) {
    pob.Jewels.push(pob.ParsedItems[val['@itemId']]);
  }
  
  // inventory Abyssal Socket
  for (let k = 0; k < pob.Items.CurrentItemSet.Slot.length; k++) {
    let val = pob.Items.CurrentItemSet.Slot[k];
    if (val['@itemId'] == '0') {
      continue; // Skip this iteration
    }
    if (val['@name'].indexOf('Belt Abyssal Socket') != -1) {
      pob.Jewels.push(pob.ParsedItems[val['@itemId']]);
    }
  }

  sortJewels(pob);
}

function initGears()
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

function refineGears(pob)
{
  if (pob.Items.ItemSet['@id']) {
    pob.Items.ItemSet = [pob.Items.ItemSet];
  }

  pob.Items.CurrentItemSet = pob.Items.ItemSet[0];
  for (let k = 0; k < pob.Items.ItemSet.length; k++) {
    let itemSet = pob.Items.ItemSet[k];
    if (itemSet['@id'] == pob.Items['@activeItemSet']) {
      pob.Items.CurrentItemSet = itemSet;
      break;
    }
  }
  
  pob.Gears = initGears();
  pob.Flasks = [];
  pob.Gears2 = [];
  for (let k = 0; k < pob.Items.CurrentItemSet.Slot.length; k++) {
    let val = pob.Items.CurrentItemSet.Slot[k];
    if (val['@itemId'] == '0') {
      continue; // Skip this iteration
    }
    let parsedItem = Object.assign({}, pob.ParsedItems[val['@itemId']]); // Force copy to fix same item used twice issue
    parsedItem.slot = val['@name'].replaceAll(' ', '');
    //pob.Gears[parsedItem.slot] = parsedItem;
    if (pob.Gears[parsedItem.slot]) {
      parsedItem.ratio = pob.Gears[parsedItem.slot].ratio;
      if (parsedItem.slot.indexOf('Flask') == -1) {
        pob.Gears2.push(parsedItem);
      } else {
        pob.Flasks.push(parsedItem);
      }
    }
  }  
}

function refineOverrides(pob)
{
  pob.Overrides = [];
  let Overrides = {};
  if (!pob.Tree.CurrentSpec.Overrides) {
    return;
  }
  $.each(pob.Tree.CurrentSpec.Overrides.Override, function(k, val) {
    let override = OVERRIDES[val['@dn']];
    if (override) {
      //val['@dn'] = override['@dn'];
      //val['#text'] = override['#text'];
      Object.assign(val, override);
    }
    if (Overrides[val['@dn']]) {
      Overrides[val['@dn']].quantity ++;
    } else {
      let row = {
        name: val['@dn'],
        stats: nl2br(val['#text'].trim(), 1, 1),
        quantity: 1,
        icon: 'https://cdn.poedb.tw/image/'+val['@icon'].replace('.png', '.webp'),
      };
      Overrides[val['@dn']] = row;
    }
  });
  $.each(Overrides, function(key, val) {
    pob.Overrides.push(val);
  });
}

function refineClassIcon(pob)
{
  if (pob.Build['@className']) {
    pob.Build['@classIcon'] = 'https://cdn.poedb.tw/image/Art/2DArt/UIImages/Common/'+CLASS_ICONS[pob.Build['@className']];
    pob.Build['@classNameLocale'] = CLASSES[pob.Build['@className']];
  }
  if (pob.Build['@ascendClassName']) {
    pob.Build['@classIcon'] = 'https://cdn.poedb.tw/image/Art/2DArt/UIImages/Common/'+CLASS_ICONS[pob.Build['@ascendClassName']];
    pob.Build['@classNameLocale'] = CLASSES[pob.Build['@ascendClassName']];
  }
}

function findGemInfo(gem)
{
  let gemInfo;
  if (gem['@nameSpec']) {
    $.each(GEM_INFOS, function(k, row) {
      if (row.Code == gem['@nameSpec']) {
        gemInfo = row;
        return false;
      }
    });
    if (gemInfo) {
      return gemInfo;
    }
  }
  if (gem['@gemId']) {
    gemInfo = GEM_INFOS[gem['@gemId']];
    if (gemInfo) {
      return gemInfo;
    }
  }
}

function refineSkills(pob)
{
  const icons = {
    'Gloves': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Gloves.webp',
    'Boots': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Boots.webp',
    'Helmet': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Helmet.webp',
    'Belt': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Belt.webp',
    'Ring 1': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Ring.webp',
    'Ring 2': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Ring.webp',
    'Amulet': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Amulet.webp',
    'Quiver': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Quiver.webp',
    'Shield': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Shield.webp',
    'Body Armour': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Armour.webp',
    'Weapon 1': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/1HandedMelee.webp',
    'Weapon 2': 'Art/2DArt/UIImages/InGame/CraftingWindow/Icons/Shield.webp',
  };
  if (pob.Skills.SkillSet['@id']) {
    pob.Skills.SkillSet = [pob.Skills.SkillSet];
  }

  pob.Skills.CurrentSkillSet = pob.Skills.SkillSet[0];

  for (let i = 0; i < pob.Skills.SkillSet.length; i++) {
    const skillSet = pob.Skills.SkillSet[i];
    if (skillSet['@id'] == pob.Skills['@activeSkillSet']) {
      pob.Skills.CurrentSkillSet = skillSet;
      break;
    }
  }

  if (pob.Skills.CurrentSkillSet.Skill['@slot']) {
    pob.Skills.CurrentSkillSet.Skill = [pob.Skills.CurrentSkillSet.Skill];
  }

  $.each(pob.Skills.CurrentSkillSet.Skill, function(key, skill) {
    if (!skill.Gem) {
      return;
    }
    if (skill.Gem['@nameSpec']) {
      skill.Gem = [skill.Gem];
    }
    skill.icon = '';
    if (icon = icons[skill['@slot']]) {
      skill.icon = 'https://cdn.poedb.tw/image/'+icon;
    }
    // todo: @enabled
    $.each(skill.Gem, function(key2, gem) {
      gem['@nameLocale'] = gem['@nameSpec'];
      let gemInfo = findGemInfo(gem);
      if (gemInfo) {
        gem['@icon'] = 'https://cdn.poedb.tw/image/'+gemInfo.IconPath.replace('.png', '.webp');
        gem['@nameLocale'] = gemInfo.Name;
        gem['@color'] = GEM_COLORS[gemInfo.GemTypesID];
        gem['@ItemClassesID'] = gemInfo.ItemClassesID;
      }

      if (gem['@quality'] == '0') {
        gem['@quality'] = '';
      }
      switch(gem['@qualityId']) {
          case 'Alternate1':
            gem['@qualityName'] = GEM_ALTERNATE_QUALITIES[1]; break;
          case 'Alternate2':
            gem['@qualityName'] = GEM_ALTERNATE_QUALITIES[2]; break;
          case 'Alternate3':
            gem['@qualityName'] = GEM_ALTERNATE_QUALITIES[3]; break;
      }
    });
  });
}

function decodeRaw(raw)
{
  raw = raw.replaceAll('-', '+').replaceAll('_', '/');
  // Decode base64 (convert ascii to binary)
  var strData = atob(raw);
  // Convert binary string to character-number array
  var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});
  // Turn number array into byte-array
  var binData     = new Uint8Array(charData);
  return pako.inflate(binData, {to: 'string'});
}

function pobParse(raw)
{
  let xml_raw = decodeRaw(raw);

  //var xml = $.parseXML(xml_raw);
  const parser = new XMLParser();
  let json = parser.parse(xml_raw);
  console.log(json)

  //var jsonRaw = xml2json(xml, '');
  //var jsonRaw = convert.xml2json(xml);
  //console.log("jsonRaw done", jsonRaw);

  //var json = JSON.parse(jsonRaw);
  
  console.log("json done");
  var pob = json.PathOfBuilding;
  console.log("pobParse middle", pob);

  //refine(pob);
  
  pob.id = basename(window.location.pathname);
  if (pob.id.length == 8 || pob.id.length == 12) {
    pob.pobbin_id = pob.id;
  }
  pob.raw = raw;
  return pob;
}

function pobShow(raw)
{
  console.log("pobShow");
  pob = pobParse(raw);
  console.log("pobshow end");
  console.log(pob);
}

export default function pobInit()
{

  const paste_key = '5BE7sPHKkLxP';
  const url = "https://poedb.tw/pob/" + paste_key + "/raw";

  console.log(url);
  fetch(url,{
    headers: {
      'User-Agent': 'testing/1.0 testing (contact: testing)'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .then(raw => {
      console.log("attempt to pobshow")
      pobShow(raw);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}