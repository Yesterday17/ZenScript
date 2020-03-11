export interface ArtifactVersion {
  label: string;
  version: string;
  range: string;
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
  requiredMods: ArtifactVersion[];
  dependencies: ArtifactVersion[];
  dependants: ArtifactVersion[];
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

export interface ZenPackageEntry {
  members: { [key: string]: MemberMethod | MemberGetter | MemberSetter };
  staticMembers: { [key: string]: MemberMethod | MemberGetter | MemberSetter };
}

export interface MemberMethod {
  methods: MemberJavaMethod[];
}

export interface MemberJavaMethod {
  params: string[];
  return: string;
}

export interface MemberGetter {
  getter: string;
}

export interface MemberSetter {
  setter: string;
}

export interface ProbeConfig {
  mods: boolean;
  items: boolean;
  enchantments: boolean;
  entities: boolean;
  fluids: boolean;
  oredictionary: boolean;
}

export interface ZSRCFile {
  mcVersion: string;
  forgeVersion: string;
  probeVersion: string;
  config: ProbeConfig;

  mods: ModEntry[];
  items: ItemEntry[];
  enchantments: EnchantmentEntry[];
  entities: EntityEntry[];
  fluids: FluidEntry[];
  oredictionary: string[];

  zentype: string[];
  zenpackage: {
    [key: string]: ZenPackageEntry;
  };
  globals: {
    [key: string]: string | MemberJavaMethod;
  };
}
