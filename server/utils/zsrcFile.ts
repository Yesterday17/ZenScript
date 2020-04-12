import get from 'get-value';
import set from 'set-value';
import { zGlobal } from '../api/global';
import { MemberGetter, MemberMethod, MemberSetter } from '../api/rcFile';
import * as fs from '../utils/fs';
import * as path from './path';

function isMemberMethod(p: any): p is MemberMethod {
  return typeof p['methods'] !== 'undefined';
}

function isMemberGetter(p: any): p is MemberGetter {
  return typeof p['getter'] !== 'undefined';
}

function isMemberSetter(p: any): p is MemberSetter {
  return typeof p['setter'] !== 'undefined';
}

/**
 * Reload /scripts/.zsrc
 */
export async function reloadRCFile() {
  zGlobal.bus.revoke('rc-loaded');
  try {
    if (
      !(await fs.existInDirectory(zGlobal.baseFolderUri, '.zsrc', zGlobal.conn))
    ) {
      zGlobal.isProject = false;
      return;
    }

    const json = await fs.readFileString(
      path.join(zGlobal.baseFolderUri, '.zsrc'),
      zGlobal.conn
    );
    zGlobal.rcFile = JSON.parse(json);

    // Reload Mods
    zGlobal.mods.clear();
    if (zGlobal.rcFile.config.mods && zGlobal.rcFile.mods) {
      zGlobal.rcFile.mods.forEach((value) => {
        zGlobal.mods.set(value.modid, value);
      });
    }

    // Items
    zGlobal.items.clear();
    if (zGlobal.rcFile.config.items && zGlobal.rcFile.items) {
      zGlobal.rcFile.items.forEach((value) => {
        try {
          const key = [
            value.resourceLocation.domain,
            value.resourceLocation.path,
            value.metadata,
          ].join(':');
          zGlobal.items.set(key, value);
        } catch (e) {
          zGlobal.console.error(
            `Failed to load item: ${value.unlocalizedName}`
          );
        }
      });
    }

    // Enchantments
    zGlobal.enchantments.clear();
    if (zGlobal.rcFile.config.enchantments && zGlobal.rcFile.enchantments) {
      zGlobal.rcFile.enchantments.forEach((value) => {
        if (!zGlobal.enchantments.has(value.resourceLocation.domain)) {
          zGlobal.enchantments.set(value.resourceLocation.domain, [value]);
        } else {
          zGlobal.enchantments.get(value.resourceLocation.domain).push(value);
        }
      });
    }

    // Entities
    zGlobal.entities.clear();
    if (zGlobal.rcFile.config.entities && zGlobal.rcFile.entities) {
      zGlobal.rcFile.entities.forEach((value) => {
        if (!zGlobal.entities.has(value.resourceLocation.domain)) {
          zGlobal.entities.set(value.resourceLocation.domain, [value]);
        } else {
          zGlobal.entities.get(value.resourceLocation.domain).push(value);
        }
      });
    }

    // Fluids
    zGlobal.fluids.clear();
    if (zGlobal.rcFile.config.fluids && zGlobal.rcFile.fluids) {
      zGlobal.rcFile.fluids.forEach((value) =>
        zGlobal.fluids.set(value.unlocalizedName, value)
      );
    }

    // ZenPackages
    zGlobal.packages = {};
    if (zGlobal.rcFile.config.zenpackage && zGlobal.rcFile.zenpackage) {
      for (const key in zGlobal.rcFile.zenpackage) {
        const _this = zGlobal.rcFile.zenpackage[key];
        const members: { [key: string]: any } = {};

        function setMember(
          mem: { [key: string]: MemberMethod | MemberGetter | MemberSetter },
          isStatic: boolean
        ) {
          for (const m in mem) {
            const __this = mem[m];
            let member = {};
            if (isMemberMethod(__this)) {
              member = {
                static: isStatic,
                type: 'method',
                body: __this.methods,
              };
            } else if (isMemberGetter(__this)) {
              member = {
                static: isStatic,
                type: 'getter',
                body: __this.getter,
              };
            } else if (isMemberSetter(__this)) {
              member = {
                static: isStatic,
                type: 'setter',
                body: __this.setter,
              };
            }
            members[m] = member;
          }
        }

        setMember(_this.members, false);
        setMember(_this.staticMembers, true);
        set(zGlobal.packages, key, members);
      }
    }

    zGlobal.global.clear();
    zGlobal.globalFunction.clear();
    if (zGlobal.rcFile.config.globals && zGlobal.rcFile.globals) {
      for (const key in zGlobal.rcFile.globals) {
        const _this = zGlobal.rcFile.globals[key];
        if (typeof _this === 'string') {
          // variable
          zGlobal.global.set(
            key,
            get(zGlobal.packages, _this.replace('.api', '')) // FIXME: .api hack
          );
        } else {
          // function
          zGlobal.globalFunction.set(key, [_this]);
        }
      }
    }

    zGlobal.bus.finish('rc-loaded');
  } catch (e) {
    zGlobal.console.error(e.message);
  }
}
