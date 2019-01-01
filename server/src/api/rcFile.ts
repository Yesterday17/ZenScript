export interface ItemEntry {
  domain: string;
  path: string;
  unlocalizedName: string;
  localizedName: string;
}

export interface ModEntry {
  modid: string;
  name: string;
  description: string;
  url: string;
  updateUrl: string;
  updateJSON: string;
  logoFile: string;
  version: string;
  authorList: string[];
  credits: string;
  parent: string;
  screenshots: string[];
  useDependencyInformation: boolean;
}

export interface ZSRCFile {
  mcVersion: string;
  forgeVersion: string;

  mods: ModEntry[];
  items: ItemEntry[];
}
