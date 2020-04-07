import { ZenScriptSettings } from '../api';
import { zGlobal } from '../api/global';

export function getdocumentSettings(
  resource: string
): Promise<ZenScriptSettings> {
  if (zGlobal.setting) {
    return Promise.resolve(zGlobal.setting);
  }

  if (!zGlobal.documentSettings.has(resource)) {
    zGlobal.documentSettings.set(
      resource,
      zGlobal.conn.workspace.getConfiguration({
        scopeUri: resource,
        section: 'zenscript',
      })
    );
  }
  return zGlobal.documentSettings.get(resource);
}
