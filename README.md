# alfred
shopify scripts

First hook up to your Shopify store!!!
Create a config.js file that looks like sample-config.js

Income Statement Generator
1. Set 4 variables in income-statement.js:
FIRST_ROW: the row of the first product in cost.xlsx
LAST_ROW: the row of the last product in cost.xlsx
MONTH: the month you're interested in
YEAR: the year you're interested in
2. Run 'node income-statement.js'
3. Console will output the following: quantity sold, gross sales, total discounts, cost of goods sold

Tag Orders by Courier
1. This requires that you fulfill orders in shopify and enter a tracking url
2. Run 'tag-courier.js'
3. Go to Shopify orders page and filter by orders tagged with 'cod-xend', 'cod-ninjavan', etc.


