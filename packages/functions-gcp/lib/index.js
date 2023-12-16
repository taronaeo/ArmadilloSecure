/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 52:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.auth_onUserCreate = void 0;
const logger = __webpack_require__(837);
const shared_1 = __webpack_require__(978);
const firestore_1 = __webpack_require__(594);
const identity_1 = __webpack_require__(462);
const firebase_1 = __webpack_require__(99);
exports.auth_onUserCreate = (0, identity_1.beforeUserCreated)(async (event) => {
    logger.log(event);
    const { data: { uid, email }, } = event;
    const user = {
        uid,
        email,
        email_verified: false,
        full_name: null,
        headshot_url: null,
        is_onboarded: false,
        is_suspended: false,
        updated_at: firestore_1.FieldValue.serverTimestamp(),
        created_at: firestore_1.FieldValue.serverTimestamp(),
    };
    try {
        logger.log(user);
        await firebase_1.firestore.collection(shared_1.USERS_COLLECTION).doc(uid).set(user, { merge: true });
    }
    catch (error) {
        logger.error(error);
    }
    return {};
});


/***/ }),

/***/ 99:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.functions = exports.firestore = exports.storage = exports.auth = void 0;
const app_1 = __webpack_require__(325);
const auth_1 = __webpack_require__(877);
const storage_1 = __webpack_require__(274);
const firestore_1 = __webpack_require__(594);
const functions_1 = __webpack_require__(641);
/**
 * Singleton Firebase app instance
 *
 * @remarks
 * This is to prevent hot Cloud Functions from crashing
 */
const app = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)();
exports.auth = (0, auth_1.getAuth)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.firestore = (0, firestore_1.getFirestore)(app);
exports.functions = (0, functions_1.getFunctions)(app);


/***/ }),

/***/ 607:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Auto-init Firebase Admin
__webpack_require__(99);
const v2_1 = __webpack_require__(758);
(0, v2_1.setGlobalOptions)({
    maxInstances: 1,
    concurrency: 1000,
    timeoutSeconds: 60,
    region: 'asia-southeast1',
});
// Export Cloud Functions below
__exportStar(__webpack_require__(52), exports);


/***/ }),

/***/ 9:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FILES_COLLECTION = exports.USERS_COLLECTION = void 0;
exports.USERS_COLLECTION = 'users';
exports.FILES_COLLECTION = 'files';


/***/ }),

/***/ 978:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9), exports);
__exportStar(__webpack_require__(791), exports);


/***/ }),

/***/ 791:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 325:
/***/ ((module) => {

module.exports = require("firebase-admin/app");

/***/ }),

/***/ 877:
/***/ ((module) => {

module.exports = require("firebase-admin/auth");

/***/ }),

/***/ 594:
/***/ ((module) => {

module.exports = require("firebase-admin/firestore");

/***/ }),

/***/ 641:
/***/ ((module) => {

module.exports = require("firebase-admin/functions");

/***/ }),

/***/ 274:
/***/ ((module) => {

module.exports = require("firebase-admin/storage");

/***/ }),

/***/ 837:
/***/ ((module) => {

module.exports = require("firebase-functions/logger");

/***/ }),

/***/ 758:
/***/ ((module) => {

module.exports = require("firebase-functions/v2");

/***/ }),

/***/ 462:
/***/ ((module) => {

module.exports = require("firebase-functions/v2/identity");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(607);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map