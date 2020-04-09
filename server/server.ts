import { zGlobal } from './api/global';
import { applyRequests } from './requests/requests';
import { ZenScriptInitialize } from './services/zsInit';

zGlobal.preInit();

ZenScriptInitialize.register();

// apply all requests
applyRequests(zGlobal.conn);

zGlobal.postInit();
zGlobal.listen();
