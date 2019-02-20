'use strict';

const MessageType = {
  ENTER_ORDER: 'E',
  CANCEL_ORDER: 'X',
  ORDER_ACCEPTED: 'A',
  ORDER_REJECTED: 'R',
  ORDER_EXECUTED: 'E',
  ORDER_CANCELED: 'X',
};

exports.MessageType = MessageType;

const Side = {
  BUY: 'B',
  SELL: 'S'
};

exports.Side = Side;

const OrderRejectReason = {
  UNKNOWN_INSTRUMENT: 'I',
  INVALID_PRICE: 'P',
  INVALID_QUANTITY: 'Q',
};

exports.OrderRejectReason = OrderRejectReason;

const OrderCancelReason = {
  REQUEST: 'R',
  SUPERVISORY: 'S',
};

exports.OrderCancelReason = OrderCancelReason;

exports.formatInbound = (message) => {
  switch (message.messageType) {
    case MessageType.ENTER_ORDER:
      return formatEnterOrder(message);
    case MessageType.CANCEL_ORDER:
      return formatCancelOrder(message);
    default:
      throw new Error('Unknown message type: ' + message.messageType);
  }
};

exports.parseInbound = (buffer) => {
  const messageType = buffer.readUInt8(0);

  switch (messageType) {
    case 0x45:
      return parseEnterOrder(buffer);
    case 0x58:
      return parseCancelOrder(buffer);
    default:
      throw new Error('Unknown message type: ' + messageType);
  }
};

function formatEnterOrder(message) {
  const buffer = Buffer.allocUnsafe(42);

  buffer.writeUInt8(0x45, 0);
  writeString(buffer, message.orderId, 1, 16);
  writeString(buffer, message.side, 17, 1);
  writeString(buffer, message.instrument, 18, 8);
  writeUInt64BE(buffer, message.quantity, 26);
  writeUInt64BE(buffer, message.price, 34);

  return buffer;
}

function parseEnterOrder(buffer) {
  return {
    messageType: MessageType.ENTER_ORDER,
    orderId: readString(buffer, 1, 16),
    side: readString(buffer, 17, 1),
    instrument: readString(buffer, 18, 8),
    quantity: readUInt64BE(buffer, 26),
    price: readUInt64BE(buffer, 34),
  };
}

function formatCancelOrder(message) {
  const buffer = Buffer.allocUnsafe(25);

  buffer.writeUInt8(0x58, 0);
  writeString(buffer, message.orderId, 1, 16);
  writeUInt64BE(buffer, message.quantity, 17);

  return buffer;
}

function parseCancelOrder(buffer) {
  return {
    messageType: MessageType.CANCEL_ORDER,
    orderId: readString(buffer, 1, 16),
    quantity: readUInt64BE(buffer, 17),
  };
}

exports.formatOutbound = (message) => {
  switch (message.messageType) {
    case MessageType.ORDER_ACCEPTED:
      return formatOrderAccepted(message);
    case MessageType.ORDER_REJECTED:
      return formatOrderRejected(message);
    case MessageType.ORDER_EXECUTED:
      return formatOrderExecuted(message);
    case MessageType.ORDER_CANCELED:
      return formatOrderCanceled(message);
    default:
      throw new Error('Unknown message type: ' + message.messageType);
  }
};

exports.parseOutbound = (buffer) => {
  const messageType = buffer.readUInt8(0);

  switch (messageType) {
    case 0x41:
      return parseOrderAccepted(buffer);
    case 0x52:
      return parseOrderRejected(buffer);
    case 0x45:
      return parseOrderExecuted(buffer);
    case 0x58:
      return parseOrderCanceled(buffer);
    default:
      throw new Error('Unknown message type: ' + messageType);
  }
};

function formatOrderAccepted(message) {
  const buffer = Buffer.allocUnsafe(58);

  buffer.writeUInt8(0x41, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  writeString(buffer, message.side, 25, 1);
  writeString(buffer, message.instrument, 26, 8);
  writeUInt64BE(buffer, message.quantity, 34);
  writeUInt64BE(buffer, message.price, 42);
  writeUInt64BE(buffer, message.orderNumber, 50);

  return buffer;
}

function parseOrderAccepted(buffer) {
  return {
    messageType: MessageType.ORDER_ACCEPTED,
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    side: readString(buffer, 25, 1),
    instrument: readString(buffer, 26, 8),
    quantity: readUInt64BE(buffer, 34),
    price: readUInt64BE(buffer, 42),
    orderNumber: readUInt64BE(buffer, 50),
  };
}

function formatOrderRejected(message) {
  const buffer = Buffer.allocUnsafe(26);

  buffer.writeUInt8(0x52, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  writeString(buffer, message.reason, 25, 1);

  return buffer;
}

function parseOrderRejected(buffer) {
  return {
    messageType: MessageType.ORDER_REJECTED,
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    reason: readString(buffer, 25, 1),
  };
}

function formatOrderExecuted(message) {
  const buffer = Buffer.allocUnsafe(46);

  buffer.writeUInt8(0x45, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  writeUInt64BE(buffer, message.quantity, 25);
  writeUInt64BE(buffer, message.price, 33);
  writeString(buffer, message.liquidityFlag, 41, 1);
  buffer.writeUInt32BE(message.matchNumber, 42);

  return buffer;
}

function parseOrderExecuted(buffer) {
  return {
    messageType: MessageType.ORDER_EXECUTED,
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    quantity: readUInt64BE(buffer, 25),
    price: readUInt64BE(buffer, 33),
    liquidityFlag: readString(buffer, 41, 1),
    matchNumber: buffer.readUInt32BE(42),
  };
}

function formatOrderCanceled(message) {
  const buffer = Buffer.allocUnsafe(34);

  buffer.writeUInt8(0x58, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  writeUInt64BE(buffer, message.canceledQuantity, 25);
  writeString(buffer, message.reason, 33, 1);

  return buffer;
}

function parseOrderCanceled(buffer) {
  return {
    messageType: MessageType.ORDER_CANCELED,
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    canceledQuantity: readUInt64BE(buffer, 25),
    reason: readString(buffer, 33, 1),
  };
}

function writeUInt64BE(buffer, value, offset) {
  buffer.writeUInt32BE(value / 0x100000000, offset);
  buffer.writeUInt32BE(value % 0x100000000, offset + 4);
}

function readUInt64BE(buffer, offset) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);

  return 0x100000000 * high + low;
}

function writeString(buffer, value, offset, length) {
  const count = buffer.write(value, offset, length, 'ascii');

  buffer.fill(0x20, offset + count, offset + length);
}

function readString(buffer, offset, length) {
  return buffer.toString('ascii', offset, offset + length);
}
