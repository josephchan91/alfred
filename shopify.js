const Shopify = require('shopify-api-node');
const config = require('config');

const shopify = new Shopify({
  shopName: config.shopName,
  apiKey: config.apiKey,
  password: config.password,
  autoLimit: true
});

module.exports = shopify;
