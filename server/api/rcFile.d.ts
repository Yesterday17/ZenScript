export interface ArtifactVersion {
  label: string;
  version: string;
}

export interface ResourceLocation {
  domain: string;
  path: string;
}

export interface ModEntry {
  modid: string;
  name: string;
  description: string;
  url: string;
  version: string;
  authorList: string[];
  credits: string;
  parentMod: string;
}

export interface ItemEntry {
  name: string;
  unlocalizedName: string;
  modName: string;
  resourceLocation: ResourceLocation;
  metadata: number;

  maxStackSize: number;
  maxDamage: number;

  canRepair: boolean;
  tooltips: string[];
  creativeTabStrings: string[];
}

export interface CreativeTabEntry {
  label: string;
  translatedLabel: string;
  hasSearchBar: boolean;
  itemIcon: number;
}

export interface EnchantmentEntry {
  name: string;
  unlocalizedName: string;
  resourceLocation: ResourceLocation;
  type: string;
  rarity: string;
  minLevel: number;
  maxLevel: number;
}

export interface EntityEntry {
  id: number;
  name: string;
  resourceLocation: ResourceLocation;
}

export interface FluidEntry {
  id: number;
  name: string;
  unlocalizedName: string;
  resourceLocation: ResourceLocation;
  luminosity: number;
  density: number;
  temperature: number;
  viscosity: number;
  isGaseous: boolean;
  rarity: string;
  color: number;
  still: ResourceLocation;
  flowing: ResourceLocation;
}

export interface ZSRCFile {
  mcVersion: string;
  forgeVersion: string;

  mods: ModEntry[];
  items: ItemEntry[];
  enchantments: EnchantmentEntry[];
  entities: EntityEntry[];
  fluids: FluidEntry[];
}
