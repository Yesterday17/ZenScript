import * as fs from 'fs';
import { URL } from 'url';
import { Connection } from 'vscode-languageserver';
import { zGlobal } from '../api/global';

/**
 * Reload /scripts/.zsrc
 * @param connection connection
 */
export function reloadRCFile(connection: Connection) {
  try {
    if (!fs.existsSync(new URL(zGlobal.baseFolder + '/.zsrc'))) {
      zGlobal.isProject = false;
      return;
    }

    zGlobal.rcFile = JSON.parse(
      fs.readFileSync(new URL(zGlobal.baseFolder + '/.zsrc'), {
        encoding: 'utf-8',
      })
    );

    // Reload Mods
    zGlobal.mods.clear();
    if (zGlobal.rcFile.mods) {
      zGlobal.rcFile.mods.forEach(value => {
        zGlobal.mods.set(value.modid, value);
      });
    }

    // Items
    zGlobal.items.clear();
    if (zGlobal.rcFile.items) {
      zGlobal.rcFile.items.forEach(value => {
        try {
          const key = [
            value.resourceLocation.domain,
            value.resourceLocation.path,
            value.metadata,
          ].join(':');
          zGlobal.items.set(key, value);
        } catch (e) {
          connection.console.error(
            `Failed to load item: ${value.unlocalizedName}`
          );
        }
      });
    }

    // Enchantments
    zGlobal.enchantments.clear();
    if (zGlobal.rcFile.enchantments) {
      zGlobal.rcFile.enchantments.forEach(value => {
        if (!zGlobal.enchantments.has(value.resourceLocation.domain)) {
          zGlobal.enchantments.set(value.resourceLocation.domain, [value]);
        } else {
          zGlobal.enchantments.get(value.resourceLocation.domain).push(value);
        }
      });
    }

    // Entities
    zGlobal.entities.clear();
    if (zGlobal.rcFile.entities) {
      zGlobal.rcFile.entities.forEach(value => {
        if (!zGlobal.entities.has(value.resourceLocation.domain)) {
          zGlobal.entities.set(value.resourceLocation.domain, [value]);
        } else {
          zGlobal.entities.get(value.resourceLocation.domain).push(value);
        }
      });
    }

    // Fluids
    zGlobal.fluids.clear();
    if (zGlobal.rcFile.fluids) {
      zGlobal.rcFile.fluids.forEach(value =>
        zGlobal.fluids.set(value.unlocalizedName, value)
      );
    }
  } catch (e) {
    connection.console.error(e.message);
  }
}
