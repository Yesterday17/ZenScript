import { zGlobal } from './api/global';
import { applyRequests } from './requests/requests';
import { ZenScriptInitialize } from './services/zsInit';

// Initialize connection and documents
zGlobal.init();

// Register onInitialize
ZenScriptInitialize.register();

// Register all requests
applyRequests(zGlobal.conn);

// Listen documents and connection
zGlobal.listen();
