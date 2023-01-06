const express = require('express')
const chargebee = require("chargebee")
const { json } = require('body-parser')
// CORS is enabled only for demo. Please dont use this in production unless you know about CORS
const cors = require('cors')

chargebee.configure({site : "cmc-dus1-01-test",
  api_key : "test_smP3qguc7cvGECalA1ZGoRDgY3BMHXTM"});
const app = express()

app.use(json())
app.use(cors())

const chargebee_customer_id = 'dadc0be2-d88d-4251-b6b9-40548c3e2f61'
const checkout_gateway = "gw_169lqeTQi28aa2R78";

app.post('/api/generate_payment_intent', (req, res) => {
  chargebee.payment_intent.create({
    amount: 3001,
    currency_code: "USD",
    gateway_account_id: checkout_gateway,
    customer_id: chargebee_customer_id,
  })
  .request(function(error,result) {
      if(error){
          console.log('error-729432', error)
          res.status(error.http_status_code || 500);
          res.json(error);
      } else {
          res.json(result.payment_intent);
      }
  });
});

app.post('/api/create_subscriptions', (req, res) => {
  chargebee.subscription.create_with_items(chargebee_customer_id, {
    payment_intent: req.body.paymentIntent,
    subscription_items : [
    {
      item_price_id : "Trial-USD-Weekly",
    }],
  })
  .request(function(error,result) {
      if(error){
          console.log('error-342342', error)
          res.status(error.http_status_code || 500);
          res.json(error);
      } else {
          res.json(result);
      }
  });
});

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(8000, () => console.log('Example app listening on port 8000!'))
