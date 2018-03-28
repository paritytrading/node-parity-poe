'use strict';

const POE = require('./');
const assert = require('assert');

describe('POE', function () {
  const inboundMessages = [
    {
      name: 'Enter Order',
      formatted: [
        0x45,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x42,
        0x42, 0x41, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
      ],
      parsed: {
        messageType: 'E',
        orderId: 'foo             ',
        side: 'B',
        instrument: 'BAR     ',
        quantity: 1,
        price: 2,
      },
    },
    {
      name: 'Cancel Order',
      formatted: [
        0x58,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ],
      parsed: {
        messageType: 'X',
        orderId: 'foo             ',
        quantity: 1,
      },
    },
  ];

  describe('#formatInbound()', function () {
    inboundMessages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(POE.formatInbound(message.parsed), Buffer.from(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      const message = {
        messageType: '?',
      };

      assert.throws(() => POE.formatInbound(message), /Unknown message type: \?/);
    });

    it('handles too short string', function () {
      const formatted = [
        0x58,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ];

      const parsed = {
        messageType: 'X',
        orderId: 'foo',
        quantity: 1,
      };

      assert.deepEqual(POE.formatInbound(parsed), Buffer.from(formatted));
    });

    it('handles too long string', function () {
      const formatted = [
        0x58,
        0x66, 0x6f, 0x6f, 0x20, 0x62, 0x61, 0x72, 0x20, 0x62, 0x61, 0x7a, 0x20, 0x71, 0x75, 0x75, 0x78,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
      ];

      const parsed = {
        messageType: 'X',
        orderId: 'foo bar baz quux xyzzy',
        quantity: 1,
      };

      assert.deepEqual(POE.formatInbound(parsed), Buffer.from(formatted));
    });
  });

  describe('#parseInbound()', function () {
    inboundMessages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(POE.parseInbound(Buffer.from(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      const buffer = Buffer.from([ 0x3f ]);

      assert.throws(() => POE.parseInbound(buffer), /Unknown message type: 63/);
    });
  });

  const outboundMessages = [
    {
      name: 'Order Accepted',
      formatted: [
        0x41,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x42,
        0x42, 0x41, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
        0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x06,
      ],
      parsed: {
        messageType: 'A',
        timestamp: 4294967298,
        orderId: 'foo             ',
        side: 'B',
        instrument: 'BAR     ',
        quantity: 3,
        price: 4,
        orderNumber: 21474836486,
      },
    },
    {
      name: 'Order Rejected',
      formatted: [
        0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x49,
      ],
      parsed: {
        messageType: 'R',
        timestamp: 4294967298,
        orderId: 'foo             ',
        reason: 'I',
      },
    },
    {
      name: 'Order Executed',
      formatted: [
        0x45,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
        0x41,
        0x00, 0x00, 0x00, 0x05,
      ],
      parsed: {
        messageType: 'E',
        timestamp: 4294967298,
        orderId: 'foo             ',
        quantity: 3,
        price: 4,
        liquidityFlag: 'A',
        matchNumber: 5,
      },
    },
    {
      name: 'Order Canceled',
      formatted: [
        0x58,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x52,
      ],
      parsed: {
        messageType: 'X',
        timestamp: 4294967298,
        orderId: 'foo             ',
        canceledQuantity: 3,
        reason: 'R',
      },
    },
  ];

  describe('#formatOutbound()', function () {
    outboundMessages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(POE.formatOutbound(message.parsed), Buffer.from(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      const message = {
        messageType: '?',
      };

      assert.throws(() => POE.formatOutbound(message), /Unknown message type: \?/);
    });

    it('handles too short string', function () {
      const formatted = [
        0x58,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x66, 0x6f, 0x6f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x52,
      ];

      const parsed = {
        messageType: 'X',
        timestamp: 1,
        orderId: 'foo',
        canceledQuantity: 2,
        reason: 'R',
      };

      assert.deepEqual(POE.formatOutbound(parsed), Buffer.from(formatted));
    });

    it('handles too long string', function () {
      const formatted = [
        0x58,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x66, 0x6f, 0x6f, 0x20, 0x62, 0x61, 0x72, 0x20, 0x62, 0x61, 0x7a, 0x20, 0x71, 0x75, 0x75, 0x78,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x52,
      ];

      const parsed = {
        messageType: 'X',
        timestamp: 1,
        orderId: 'foo bar baz quux xyzzy',
        canceledQuantity: 2,
        reason: 'R',
      };

      assert.deepEqual(POE.formatOutbound(parsed), Buffer.from(formatted));
    });
  });

  describe('#parseOutbound()', function () {
    outboundMessages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(POE.parseOutbound(Buffer.from(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      const buffer = Buffer.from([ 0x3f ]);

      assert.throws(() => POE.parseOutbound(buffer), /Unknown message type: 63/);
    });
  });
});
