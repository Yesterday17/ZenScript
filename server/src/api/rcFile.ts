export interface ItemEntry {
  domain: string;
  path: string;
  unlocalizedName: string;
  localizedName: string;
}

export interface ZSRCFile {
  items: ItemEntry[];
}
