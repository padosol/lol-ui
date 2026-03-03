export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}

export interface ChampionSpellData {
  id: string;
  name: string;
  description: string;
  maxrank: number;
  cooldownBurn: string;
  costBurn: string;
  resource: string;
  image: { full: string };
}

export interface ChampionData {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
  };
  info?: ChampionInfo;
  tags?: string[];
  stats?: ChampionStats;
  spells?: ChampionSpellData[];
  passive?: { name: string; description: string; image: { full: string } };
}

export interface ChampionJson {
  data: {
    [key: string]: ChampionData;
  };
}

export interface SummonerSpellData {
  id: string;
  key: string;
  name: string;
  description?: string;
  cooldown?: number[];
  image?: {
    full: string;
  };
  [key: string]: string | number | number[] | { full: string } | undefined;
}

export interface SummonerJson {
  type: string;
  version: string;
  data: {
    [key: string]: SummonerSpellData;
  };
}

export interface ItemJsonData {
  name: string;
  description: string;
  plaintext?: string;
  image: {
    full: string;
    sprite?: string;
    group?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  maps: { [key: string]: boolean };
  stats?: { [key: string]: number };
  into?: string[];
  from?: string[];
  colloq?: string;
}

export interface ItemJson {
  type: string;
  version: string;
  data: {
    [key: string]: ItemJsonData;
  };
}

export interface RuneReforgedRune {
  id: number;
  key: string;
  icon: string;
  name: string;
  shortDesc: string;
  longDesc: string;
}

export interface RuneReforgedSlot {
  runes: RuneReforgedRune[];
}

export interface RuneReforgedTree {
  id: number;
  key: string;
  icon: string;
  name: string;
  slots: RuneReforgedSlot[];
}

export type RuneReforgedData = RuneReforgedTree[];
