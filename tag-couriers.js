const shopify = require('./shopify');

shopify.order.count().then(orderCount => {
  const numberPages = Math.ceil(orderCount / 250.0);
  for (let page = 1; page <= numberPages; page++) {
    // Get all shipped orders that are not yet marked as paid.
    shopify.order.list({
      limit: 250,
      fulfillment_status: 'any',
      status: 'any'
    }).then(orders => {
      orders.forEach(order => {
        console.log(order.order_number);
        const oldTags = order.tags.split(',').map(t=>t.trim());
        let newTags = undefined;
        let isCod = false;
        let expectingRemittance = false;

        if (order.gateway === 'Cash on Delivery (COD)') {
          oldTags.push('cod');
          isCod = true;
        }

        if (!oldTags.includes('exchange')
            && !oldTags.includes('refused')
            && !oldTags.includes('no-remit')
            && !oldTags.includes('refund')) {
          expectingRemittance = true;
        }        

        const fulfillment = order.fulfillments[0];
        if (fulfillment && fulfillment.tracking_number) {
          const trackingNumber = fulfillment.tracking_number;
          const firstCharacter = trackingNumber.toLowerCase().charAt(0);
    
          if (firstCharacter == '8' || trackingNumber.length == 14) {
            // lbc
            oldTags.push('courier-lbc');
            if (isCod && expectingRemittance) {
              oldTags.push('cod-lbc');
            }
            newTags = oldTags.filter(tag => tag.length);
          } else if (firstCharacter == '7') {
            // xend
            oldTags.push('courier-xend');
            if (isCod && expectingRemittance) {
              oldTags.push('cod-xend');
            }            
            newTags = oldTags.filter(tag => tag.length);
          } else if (firstCharacter == 'n') {
            // ninjavan
            oldTags.push('courier-ninjavan');
            if (isCod && expectingRemittance) {
              oldTags.push('cod-ninjavan');
            }            
            newTags = oldTags.filter(tag => tag.length);
          }

          // update tags only if necessary
          if (newTags) {
            const orderId = order.id;
            const customer = order.customer;
            const customerName = `${customer.first_name} ${customer.last_name}`;
            console.log(`Going to update order ${order.order_number} of customer ${customerName} with tags "${newTags.toString()}"`);
            shopify.order.update(orderId, {
              tags: newTags
            }).catch(error => {
              console.log(error);
            });
          }
        }
      });
    });
  }
});