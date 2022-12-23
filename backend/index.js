const express = require('express')
const chargebee = require("chargebee")
// CORS is enabled only for demo. Please dont use this in production unless you know about CORS
const cors = require('cors')

chargebee.configure({site : "cmc-dus1-01-test",
  api_key : "test_smP3qguc7cvGECalA1ZGoRDgY3BMHXTM"});
const app = express()

app.use(express.urlencoded())
app.use(cors())

app.post('/api/generate_payment_intent', (req, res) => {
  chargebee.payment_intent.create({
    amount: req.body.amount,
    currency_code: "USD",
    gateway_account_id: "gw_169lqeTQi28aa2R78",
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
  chargebee.subscriptions.create({
    payment_intent: req.body.payment_intent,
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
