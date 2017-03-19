'use strict';

exports.formatInbound = (message) => {
  switch (message.messageType) {
    case 'E':
      return formatEnterOrder(message);
    case 'X':
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
  const buffer = Buffer.allocUnsafe(34);

  buffer.writeUInt8(0x45, 0);
  writeString(buffer, message.orderId, 1, 16);
  writeString(buffer, message.side, 17, 1);
  writeString(buffer, message.instrument, 18, 8);
  buffer.writeUInt32BE(message.quantity, 26);
  buffer.writeUInt32BE(message.price, 30);

  return buffer;
}

function parseEnterOrder(buffer) {
  return {
    messageType: 'E',
    orderId: readString(buffer, 1, 16),
    side: readString(buffer, 17, 1),
    instrument: readString(buffer, 18, 8),
    quantity: buffer.readUInt32BE(26),
    price: buffer.readUInt32BE(30),
  };
}

function formatCancelOrder(message) {
  const buffer = Buffer.allocUnsafe(21);

  buffer.writeUInt8(0x58, 0);
  writeString(buffer, message.orderId, 1, 16);
  buffer.writeUInt32BE(message.quantity, 17);

  return buffer;
}

function parseCancelOrder(buffer) {
  return {
    messageType: 'X',
    orderId: readString(buffer, 1, 16),
    quantity: buffer.readUInt32BE(17),
  };
}

exports.formatOutbound = (message) => {
  switch (message.messageType) {
    case 'A':
      return formatOrderAccepted(message);
    case 'R':
      return formatOrderRejected(message);
    case 'E':
      return formatOrderExecuted(message);
    case 'X':
      return formatOrderCanceled(message);
    case 'B':
      return formatBrokenTrade(message);
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
    case 0x42:
      return parseBrokenTrade(buffer);
    default:
      throw new Error('Unknown message type: ' + messageType);
  }
};

function formatOrderAccepted(message) {
  const buffer = Buffer.allocUnsafe(50);

  buffer.writeUInt8(0x41, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  writeString(buffer, message.side, 25, 1);
  writeString(buffer, message.instrument, 26, 8);
  buffer.writeUInt32BE(message.quantity, 34);
  buffer.writeUInt32BE(message.price, 38);
  writeUInt64BE(buffer, message.orderNumber, 42);

  return buffer;
}

function parseOrderAccepted(buffer) {
  return {
    messageType: 'A',
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    side: readString(buffer, 25, 1),
    instrument: readString(buffer, 26, 8),
    quantity: buffer.readUInt32BE(34),
    price: buffer.readUInt32BE(38),
    orderNumber: readUInt64BE(buffer, 42),
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
    messageType: 'R',
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    reason: readString(buffer, 25, 1),
  };
}

function formatOrderExecuted(message) {
  const buffer = Buffer.allocUnsafe(38);

  buffer.writeUInt8(0x45, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  buffer.writeUInt32BE(message.quantity, 25);
  buffer.writeUInt32BE(message.price, 29);
  writeString(buffer, message.liquidityFlag, 33, 1);
  buffer.writeUInt32BE(message.matchNumber, 34);

  return buffer;
}

function parseOrderExecuted(buffer) {
  return {
    messageType: 'E',
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    quantity: buffer.readUInt32BE(25),
    price: buffer.readUInt32BE(29),
    liquidityFlag: readString(buffer, 33, 1),
    matchNumber: buffer.readUInt32BE(34),
  };
}

function formatOrderCanceled(message) {
  const buffer = Buffer.allocUnsafe(30);

  buffer.writeUInt8(0x58, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  buffer.writeUInt32BE(message.canceledQuantity, 25);
  writeString(buffer, message.reason, 29, 1);

  return buffer;
}

function parseOrderCanceled(buffer) {
  return {
    messageType: 'X',
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    canceledQuantity: buffer.readUInt32BE(25),
    reason: readString(buffer, 29, 1),
  };
}

function formatBrokenTrade(message) {
  const buffer = Buffer.allocUnsafe(30);

  buffer.writeUInt8(0x42, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.orderId, 9, 16);
  buffer.writeUInt32BE(message.matchNumber, 25);
  writeString(buffer, message.reason, 29, 1);

  return buffer;
}

function parseBrokenTrade(buffer) {
  return {
    messageType: 'B',
    timestamp: readUInt64BE(buffer, 1),
    orderId: readString(buffer, 9, 16),
    matchNumber: buffer.readUInt32BE(25),
    reason: readString(buffer, 29, 1),
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
