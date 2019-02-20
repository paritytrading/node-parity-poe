// Type definitions for Parity POE 0.3.0
// Project: https://github.com/paritytrading/node-parity-poe
// Definitions by: Leo Vujanić <https://github.com/leovujanic>

import {Buffer} from "node";

export enum InboundMessageType {
    ENTER_ORDER = "E",
    CANCEL_ORDER = "X",
}

export enum OutboundMessageType {
    ORDER_ACCEPTED = "A",
    ORDER_REJECTED = "R",
    ORDER_EXECUTED = "E",
    ORDER_CANCELED = "X",
}

export enum Side {
    BUY = "B",
    SELL = "S"
}

export enum OrderRejectReason {
    UNKNOWN_INSTRUMENT = "I",
    INVALID_PRICE = "P",
    INVALID_QUANTITY = "Q",
}

export enum OrderCancelReason {
    REQUEST = "R",
    SUPERVISORY = "S",
}

export interface EnterOrder {
    messageType: InboundMessageType.ENTER_ORDER;
    orderId: string;
    side: Side;
    instrument: string;
    quantity: number;
    price: number;
}

export interface CancelOrder {
    messageType: InboundMessageType.CANCEL_ORDER;
    orderId: string;
    quantity: number;
}

export enum LiquidityFlag {
    ADDED_LIQUIDITY  = "A",
    REMOVED_LIQUIDITY = "R",
}

export interface OrderAccepted {
    messageType: OutboundMessageType.ORDER_ACCEPTED;
    timestamp: number;
    orderId: string;
    side: Side;
    instrument: string;
    quantity: number;
    price: number;
    orderNumber: number;
}

export interface OrderRejected {
    messageType: OutboundMessageType.ORDER_REJECTED;
    timestamp: number;
    orderId: string;
    reason: OrderRejectReason;
}

export interface OrderExecuted {
    messageType: OutboundMessageType.ORDER_EXECUTED;
    timestamp: number;
    orderId: string;
    quantity: number;
    price: number;
    liquidityFlag: LiquidityFlag;
    matchNumber: number;
}

export interface OrderCanceled {
    messageType: OutboundMessageType.ORDER_CANCELED;
    timestamp: number;
    orderId: string;
    canceledQuantity: number;
    reason: OrderCancelReason
}

/**
 * @param {EnterOrder | CancelOrder} message
 * @return {Buffer}
 */
export function formatInbound(message: EnterOrder | CancelOrder): Buffer;

/**
 * @param {Buffer} buffer
 * @return {EnterOrder | CancelOrder}
 */
export function parseInbound(buffer: Buffer): EnterOrder | CancelOrder;

/**
 *
 * @param {OrderAccepted | OrderRejected | OrderExecuted | OrderCanceled} message
 * @return {Buffer}
 */
export function formatOutbound(message: OrderAccepted | OrderRejected | OrderExecuted | OrderCanceled): Buffer;

/**
 * @param {Buffer} buffer
 * @return {OrderAccepted | OrderRejected | OrderExecuted | OrderCanceled}
 */
export function parseOutbound(buffer: Buffer): OrderAccepted | OrderRejected | OrderExecuted | OrderCanceled;


