import {
  ItemEntry,
  ModEntry,
  ZSRCFile,
  EntityEntry,
  EnchantmentEntry
} from "./rcFile";
import { ZenScriptSettings } from "./setting";

export const zGlobal = {
  // 是否为 Project
  isProject: true as boolean,

  // Project 的根目录
  baseFolder: "" as string,

  // 全局设置
  setting: {} as ZenScriptSettings,

  // .zsrc 文件
  rcFile: {
    mcVersion: "",
    forgeVersion: "",
    mods: [],
    items: []
  } as ZSRCFile,

  mods: new Map<string, ModEntry>(),
  items: new Map<string, ItemEntry[]>(),
  enchantments: new Map<string, EnchantmentEntry[]>(),
  entities: new Map<string, EntityEntry[]>()
};
