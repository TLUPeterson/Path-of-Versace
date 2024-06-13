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
    refinePlayerStat(pob);
    refineSkills(pob);
    refineTree(pob);
    refineKeystones(pob);
    refineMasteries(pob);
    refineOverrides(pob);
    refineItems(pob);
    refineGears(pob);
    refineJewels(pob);
    pob.mainSkill = findMainSkill(pob);
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

  function refineTree(pob)
  {
    if (pob.Tree.Spec.URL) {
      pob.Tree.Spec = [pob.Tree.Spec];
    }
    pob.Tree.CurrentSpec = pob.Tree.Spec[parseInt(pob.Tree['@activeSpec'])-1];
    pob.Tree.CurrentSpec.baseURL = basename(pob.Tree.CurrentSpec.URL);
    pob.Tree.CurrentSpec.officialURL = getPassiveUrl(getPageLang())+'fullscreen-passive-skill-tree/'+basename(pob.Tree.CurrentSpec.URL);
  }

  function findMainSkill(pob)
  {
    if (!pob.Build['@mainSocketGroup']) {
      return '';
    }
    let mainSocketGroup = parseInt(pob.Build['@mainSocketGroup'])-1;
    let Skill = pob.Skills.CurrentSkillSet.Skill[mainSocketGroup];
    let Gem = Skill.Gem[0];
    $.each(Skill.Gem, function(k, val) {
      if (val['@ItemClassesID'] == 18) {
        Gem = val;
        return false;
      }
    });
    /*
    let mainActiveSkill = parseInt(Skill['@mainActiveSkill'])-1;
    let Gem = Skill.Gem[mainActiveSkill];
    */
    if (Gem['@nameLocale']) {
      return Gem['@nameLocale'];
    }
    return Gem['@nameSpec'];
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

  function parseTooltip(text)
  {
    text = text.trim();
    let lines = text.split(/\r?\n/);
    let item = {
        stats: [],
        stats2: {},
        implicits: [],
        explicits: [],
        icon: '',
    };
    //
    line = lines.shift();
    let rarity = line.split(': ');
    item[rarity[0]] = rarity[1];
    item.bg_color = 'bg_'+item.Rarity;
    switch(item.Rarity) {
      case 'NORMAL':
      case 'MAGIC':
        item.baseType = item.typeLine = lines.shift();
        break;
      case 'RARE':
      case 'UNIQUE':
      case 'RELIC':
        item.name = lines.shift();
        item.baseType = item.typeLine = lines.shift();
        item.line = 'doubleLine';
        break;
    }
    let itemInfo = searchItemInfo(item);
    if (itemInfo) {
      if (itemInfo.icon.indexOf('Art/2DItems/Flasks/') == -1) {
        item.icon = 'https://web.poecdn.com/image/'+itemInfo.icon;
      } else {
        item.icon = 'https://cdn.poedb.tw/image/'+itemInfo.icon.replace('.png', '.webp');
      }
      if (itemInfo.isFlask) {
        item.isFlask = itemInfo.isFlask;
      }
    }
    let implicits;
    let skipAttrs = [
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
    ];
    while(lines.length) {
      line = lines.shift();
      let stat = line.explode(': ', 2);
      if (stat.length == 2) {
        if (val = item.stats2[stat[0]]) {
          //if (Object.prototype.toString.call(val) == '[object Array]') {
          //  item.stats2[stat[0]].push(stat[1]);
          //}
        } else {
          item.stats2[stat[0]] = stat[1];
        }
      }
      if ($.inArray(stat[0], skipAttrs) != -1) {
        continue;
      }
      if (stat[0] == 'Quality' && stat[1] == '0') {
        continue;
      }
      if (stat[0] != "Implicits") {
        item.stats.push(line);
        continue;
      }
      implicits = parseInt(stat[1]);
      break;
    }
    for(i=0; i<implicits; i++) {
      line = lines.shift();
      line = modifierPretty(line, item);
      if (line) {
        item.implicits.push(line);
      }
    }
    $.each(lines, function(k, line) {
      line = modifierPretty(line, item);
      if (line) {
        item.explicits.push(line);
      }
    });
    return item;
  }

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
    if (getPageLang() == 'us') {
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

  function displayTooltip(item)
  {
    let out = '';
    let block = [];
    let header = [];
    if (item.stats.length) {
      let stats = [];
      $.each(item.stats, function(k, line) {
        let stat = line.explode(': ', 2);
        if (stat.length == 1) {
          stat[0] = translateIcon(stat[0]);
          stats.push(`<div class="valuedefault">${stat[0]}</div>`);
        } else {
          stat[0] = translateItemAttr(stat[0]);
          stats.push(`<div>${stat[0]}: <span class="valuedefault">${stat[1]}</span></div>`);
        }
      });
      block.push(stats.join(''));
    }
    if (item.implicits.length) {
      let implicits = [];
      $.each(item.implicits, function(k, val) {
        val.line = translateStat(val.line);
        implicits.push(`<div class="${val.style}">${val.line}</div>`);
      });
      block.push('<div class="implicitMod">'+implicits.join('')+'</div>');
    }
    if (item.explicits.length) {
      let explicits = [];
      $.each(item.explicits, function(k, val) {
        val.line = translateStat(val.line);
        explicits.push(`<div class="${val.style}">${val.line}</div>`);
      });
      block.push('<div class="explicitMod">'+explicits.join('')+'</div>');
    }
    let RARITIES = {
        'NORMAL': 'Normal',
        'MAGIC': 'Magic',
        'RARE': 'Rare',
        'UNIQUE': 'Unique',
        'RELIC': 'Relic',
    };
    item.rarity = RARITIES[item.Rarity];
    item.statsDisplay = block.join('<div class="separator"></div>');
    // 放最後，會影響圖片
    if (item.name) {
      item.name = translateItem(item.name);
    }
    item.typeLine = translateItem(item.typeLine);

    var template = $("#itemPopup").html();
    Mustache.tags = [ '<%', '%>' ];
    return Mustache.render(template, item);
  }

  function refineItems(pob)
  {
    let itemids = {};
    $.each(pob.Items.Item, function(k, val) {
      let tooltip = parseTooltip(val['#text']);
      val['tooltip'] = displayTooltip(tooltip);
      Object.assign(val, tooltip);
      itemids[val['@id']] = val;
    });
    pob.ParsedItems = itemids;
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
    $.each(pob.Tree.CurrentSpec.Sockets.Socket, function(k, val) {
      pob.Jewels.push(pob.ParsedItems[val['@itemId']]);
    });
    // inventory Abyssal Socket
    $.each(pob.Items.CurrentItemSet.Slot, function(k, val) {
      if (val['@itemId'] == '0') {
        return; // =continue;
      }
      if (val['@name'].indexOf('Belt Abyssal Socket') != -1) {
        pob.Jewels.push(pob.ParsedItems[val['@itemId']]);
      }
    });
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
    $.each(pob.Items.ItemSet, function(k, itemSet) {
      if (itemSet['@id'] == pob.Items['@activeItemSet']) {
        pob.Items.CurrentItemSet = itemSet;
        return false;
      }
    });

    pob.Gears = initGears();
    pob.Flasks = [];
    pob.Gears2 = [];
    $.each(pob.Items.CurrentItemSet.Slot, function(k, val) {
      if (val['@itemId'] == '0') {
        return; // =continue;
      }
      let parsedItem = Object.assign({}, pob.ParsedItems[val['@itemId']]); // force copy to fix same item used twice issue
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
    });
  }

  function refineKeystones(pob)
  {
    pob.Keystones = [];
    let nodes = pob.Tree.CurrentSpec['@nodes'].split(',');
    $.each(nodes, function(k, nodeId) {
      let node = passiveSkillTreeData['nodes'][nodeId];
      if (!node) {
        return; // =continue;
      }

      if (node.isKeystone) {
        let row = {
            name: node.name,
            stats: nl2br(node.stats.join("<br/>"), 1, 1),
            icon: 'https://cdn.poedb.tw/image/'+node.icon.replace('.png', '.webp'),
        };
        pob.Keystones.push(row);
      }
    });
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

  function refineMasteries(pob)
  {
    pob.Masteries = [];
    const regexp = /\d+,\d+/g;
    const str = pob.Tree.CurrentSpec['@masteryEffects'];
    const matches = str.matchAll(regexp);
    for (const match of matches) {
      const myArray = match[0].split(',');
      let nodeId = myArray[0];
      let node = passiveSkillTreeData['nodes'][nodeId];
      if (!node) {
        continue;
      }
      $.each(node.masteryEffects, function(k, val) {
        if (val.effect == myArray[1]) {
          const row = {
            name: node.name,
            stats: val.stats.join("\n"),
            icon: 'https://cdn.poedb.tw/image/'+node.icon.replace('.png', '.webp'),
          };
          pob.Masteries.push(row);
        }
      });
    }
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

    if (pob.Skills.SkillSet['@id']) {
      pob.Skills.SkillSet = [pob.Skills.SkillSet];
    }

    pob.Skills.CurrentSkillSet = pob.Skills.SkillSet[0];
    $.each(pob.Skills.SkillSet, function(k, skillSet) {
      if (skillSet['@id'] == pob.Skills['@activeSkillSet']) {
        pob.Skills.CurrentSkillSet = skillSet;
        return false;
      }
    });

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

  function refinePlayerStat(pob)
  {
    let PlayerStat = {};
    $.each(pob.Build.PlayerStat, function(key, stat) {
      PlayerStat[stat['@stat']] = stat['@value'];
    });
    if (PlayerStat.LifeUnreserved) {
      PlayerStat.LifeUnreserved = parseInt(PlayerStat.LifeUnreserved);
      PlayerStat.LifeUnreserved = PlayerStat.LifeUnreserved.toLocaleString('us');
    }
    if (PlayerStat.Evasion) {
      PlayerStat.Evasion = parseInt(PlayerStat.Evasion);
      PlayerStat.Evasion = PlayerStat.Evasion.toLocaleString('us');
    }
    if (PlayerStat.FullDPS != '0') {
      PlayerStat.FullDPS = parseInt(PlayerStat.FullDPS);
      PlayerStat.FullDPS = PlayerStat.FullDPS.toLocaleString('us');
    } else if (PlayerStat.CombinedDPS) {
      PlayerStat.FullDPS = parseInt(PlayerStat.CombinedDPS);
      PlayerStat.FullDPS = PlayerStat.FullDPS.toLocaleString('us');
    }
    if (PlayerStat.TotalEHP) {
      PlayerStat.TotalEHP = parseInt(PlayerStat.TotalEHP);
      PlayerStat.TotalEHP = PlayerStat.TotalEHP.toLocaleString('us');
    }
    if (PlayerStat.Speed) {
      PlayerStat.Speed = parseFloat(PlayerStat.Speed).toFixed(2);
    }
    if (PlayerStat.CritChance) {
      PlayerStat.CritChance = parseFloat(PlayerStat.CritChance).toFixed(2);
    }
    if (PlayerStat.CritMultiplier) {
      PlayerStat.CritMultiplier = parseInt(parseFloat(PlayerStat.CritMultiplier)*100);
    }
    pob.Build.PlayerStat = PlayerStat;
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
    var xml = $.parseXML(xml_raw);
    var jsonRaw = xml2json(xml, '');
    var json = JSON.parse(jsonRaw);
    var pob = json.PathOfBuilding;
    refine(pob);
    pob.id = basename(window.location.pathname);
    if (pob.id.length == 8 || pob.id.length == 12) {
      pob.pobbin_id = pob.id;
    }
    pob.raw = raw;
    return pob;
  }

  function pobShow(raw)
  {
    var template = $("#mp_template").html();
    Mustache.tags = [ '<%', '%>' ];
    pob = pobParse(raw);
    var text = Mustache.render(template, pob);
    $("#mypob").html(text);

    $("#gear").html(Mustache.render($("#gear_template").html(), pob));
    $("#gem").html(Mustache.render($("#gem_template").html(), pob));
    $("#passive").html(Mustache.render($("#passive_template").html(), pob));
  }

function pobInit()
{
  const paste_key = basename(window.location.pathname);
  $.ajax({
    type: "GET",
    url: "https://poedb.tw/pob/"+paste_key+"/raw",
    success: function(raw){
      pobShow(raw);
      $('[data-bs-toggle="tooltip"]').tooltip({html: true});
      localize();
      $('#Skills').masonry();
    }
  });
  new ClipboardJS('.btn');
}
