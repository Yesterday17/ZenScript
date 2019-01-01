import { ZSRCFile, ItemEntry, ModEntry } from "./rcFile";

export const zGlobal = {
  // 是否为 Project
  isProject: true as boolean,

  // Project 的根目录
  baseFolder: "" as string,

  // .zsrc 文件
  rcFile: {
    mcVersion: "",
    forgeVersion: "",
    mods: [],
    items: []
  } as ZSRCFile,

  mods: new Map<string, ModEntry>(),
  items: new Map<string, ItemEntry[]>()
};
