import { ZSRCFile, ItemEntry } from "./rcFile";

export const zGlobal = {
  // 是否为 Project
  isProject: true as boolean,

  // Project 的根目录
  baseFolder: "" as string,

  // .zsrc 文件
  rcFile: {
    items: []
  } as ZSRCFile,

  items: new Map<string, ItemEntry[]>()
};
