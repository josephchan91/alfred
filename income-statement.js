const FIRST_ROW = 2;
const LAST_ROW = 13;
const MONTH = 6; // JANUARY = 1
const YEAR = 2017;
const COST_FILE = 'anarkyzt-cost.xlsx';

const minDate = new Date(YEAR, MONTH-1, 1);
let maxDate = new Date(YEAR, MONTH, 1);
maxDate.setSeconds(maxDate.getSeconds() - 1);

console.log(`minDate: ${minDate}`);
console.log(`maxDate: ${maxDate}`);

if (typeof require !== 'undefined') XLSX = require('xlsx');

const workbook = XLSX.readFile(COST_FILE);

const worksheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[worksheetName];

console.log(worksheet['!ref']);
const styleData = {}
for (let row = FIRST_ROW; row <= LAST_ROW; row++) {
  const style = worksheet[`A${row}`].v.toLowerCase();
  const cost = worksheet[`F${row}`].v;
  const originalPrice = worksheet[`G${row}`].v;
  styleData[style] = {
    cost: cost,
    originalPrice: originalPrice
  };
}

const shopify = require('./shopify');

let quantitySold = 0;
let grossSales = 0;
let netSales = 0;
let cogs = 0;

shopify.order.count({
    created_at_min: minDate,
    created_at_max: maxDate,
    limit: 250
  })
  .then(orderCount => {
    console.log(`Found ${orderCount} orders for month ${MONTH}`);
    const numberPages = Math.ceil(orderCount / 250.0);
    for (let page = 1; page <= numberPages; page++) {
      shopify.order.list({
          created_at_min: minDate,
          created_at_max: maxDate,
          page: page,
          fields: 'created_at, line_items, total_discounts, total_price, order_number',
          limit: 250
        })
        .then(orders => {
          orders.forEach(order => {
            console.log(order.order_number);
            order.line_items.forEach(lineItem => {
              const style = lineItem.title.toLowerCase();
              quantitySold++;
              grossSales += styleData[style].originalPrice;
              cogs += styleData[style].cost;
            });
            netSales += parseInt(order.total_price);
            if (quantitySold == orderCount) {
              console.log(`\nquantitySold: ${quantitySold}\ngrossSales: ${grossSales}\ndiscounts: ${grossSales-netSales}\ncogs: ${cogs}`);
            }
          });
        })
        .catch(err => {
          console.log(`Error getting orders list: ${err}`);
        });
    }
  }).catch(err => {
    console.log(`Error getting order count: ${err}`);
  });
