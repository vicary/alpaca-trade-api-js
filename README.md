# Alpaca Trade API JS

[![npm version](https://img.shields.io/npm/v/@alpacahq/alpaca-trade-api.svg)](https://www.npmjs.com/package/@alpacahq/alpaca-trade-api)
[![CircleCI](https://circleci.com/gh/alpacahq/alpaca-trade-api-js.svg?style=shield)](https://circleci.com/gh/alpacahq/alpaca-trade-api-js)

Node.js library for Alpaca Trade API.

## Forked Project

This is a fork of
[@alpacahq/alpaca-trading-api](https://github.com/alpacqhq/alpaca-trading-api)
with some PR merged specifically for my own need.

Use at your own risk.

### Notable Changes

1. Partial TypeScript rewrite
2. Partial options override per API method call
3. Expose `signal` option for AbortSignal
4. Port/Merge "multi" batch method into async generators
5. Combine inconsistent response object types
   1. AlpacaBar
   2. AlpacaCorrection
   3. AlpacaTrade
   4. AlpacaQuote
   5. AlpacaNews
   6. AlpacaStatus
