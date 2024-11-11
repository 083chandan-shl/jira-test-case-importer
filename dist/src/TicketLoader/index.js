"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestCasesForProject = void 0;
// TODO: Export aus Logik Klasse hinzufügen, welche der Testautomatisierung genutzt werden soll
const TicketLoader_1 = __importDefault(require("./TicketLoader"));
var TicketLoader_2 = require("./TicketLoader");
Object.defineProperty(exports, "getTestCasesForProject", { enumerable: true, get: function () { return TicketLoader_2.getTestCasesForProject; } });
exports.default = TicketLoader_1.default;
