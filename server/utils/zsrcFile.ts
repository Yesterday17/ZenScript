import { Connection } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { zGlobal } from '../api/global';
import * as fs from '../utils/fs';
import * as path from './path';

/**
 * Reload /scripts/.zsrc
 * @param connection connection
 */
export async function reloadRCFile(connection: Connection) {
  try {
    if (
      !(await fs.existInDirectory(
        URI.parse(zGlobal.baseFolder),
        '.zsrc',
        connection
      ))
    ) {
      zGlobal.isProject = false;
      return;
    }

    const json = await fs.readFileString(
      path.join(URI.parse(zGlobal.baseFolder), '.zsrc'),
      connection
    );
    zGlobal.rcFile = JSON.parse(json);

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
