import * as fs from 'fs';
import { zGlobal } from '../api/global';
import { URL } from 'url';
import { Connection } from 'vscode-languageserver';

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
    zGlobal.rcFile.mods.forEach(value => {
      zGlobal.mods.set(value.modid, value);
    });

    // Items
    zGlobal.items.clear();
    zGlobal.idMaps.items.clear();
    zGlobal.rcFile.items.forEach(value => {
      if (!zGlobal.items.has(value.resourceLocation.domain)) {
        zGlobal.items.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.items.get(value.resourceLocation.domain).push(value);
      }

      zGlobal.idMaps.items.set(value.id, value);
    });

    // Enchantments
    zGlobal.enchantments.clear();
    zGlobal.rcFile.enchantments.forEach(value => {
      if (!zGlobal.enchantments.has(value.resourceLocation.domain)) {
        zGlobal.enchantments.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.enchantments.get(value.resourceLocation.domain).push(value);
      }
    });

    // Entities
    zGlobal.entities.clear();
    zGlobal.idMaps.entities.clear();
    zGlobal.rcFile.entities.forEach(value => {
      if (!zGlobal.entities.has(value.resourceLocation.domain)) {
        zGlobal.entities.set(value.resourceLocation.domain, [value]);
      } else {
        zGlobal.entities.get(value.resourceLocation.domain).push(value);
      }

      zGlobal.idMaps.entities.set(value.id, value);
    });

    // Fluids
    zGlobal.fluids.clear();
    zGlobal.rcFile.fluids.forEach(value =>
      zGlobal.fluids.set(value.resourceLocation.domain, value)
    );
  } catch (e) {
    connection.console.error(e.message);
  }
}
