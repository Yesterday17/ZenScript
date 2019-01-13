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
  id: number;
  name: string;
  unlocalizedName: string;
  resourceLocation: ResourceLocation;
  maxStackSize: number;
  maxDamage: number;
  bFull3D: boolean;
  hasSubtypes: boolean;
  canRepair: boolean;
  containerItem: number | null;
  tabToDisplayOn: number | null;
}

export interface CreativeTabEntry {
  index: number;
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
  name: string;
  unlocalizedName: string;
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
