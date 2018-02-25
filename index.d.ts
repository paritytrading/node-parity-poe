// Type definitions for Parity POE 0.3.0
// Project: https://github.com/paritytrading/node-parity-poe
// Definitions by: Leo Vujanić <https://github.com/leovujanic>

import {Buffer} from "node";

/**
 * Declares Parity POE message structure
 * Full reference can be found here https://github.com/paritytrading/parity/blob/master/libraries/net/doc/POE.md
 */
export interface POEMessage {
    messageType: string;
    orderId?: string,
    timestamp?: number;
    canceledQuantity?: number;
    reason?: string;
    liquidityFlag?: string;
    matchNumber?: number;
    side?: string;
    instrument?: string;
    quantity?: number;
    price?: number;
}

/**
 * @param {POEMessage} message
 * @return {Buffer}
 */
export function formatInbound(message: POEMessage): Buffer;

/**
 * @param {Buffer} buffer
 * @return {POEMessage}
 */
export function parseInbound(buffer: Buffer): POEMessage;

/**
 * @param {POEMessage} message
 * @return {Buffer}
 */
export function formatOutbound(message: POEMessage): Buffer;

/**
 * @param {Buffer} buffer
 * @return {POEMessage}
 */
export function parseOutbound(buffer: Buffer): POEMessage;


