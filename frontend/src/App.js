import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'

const chargebee_customer_email = 'my_customer_email8975@hospopay.com'

const App = () => {
  const [ cbInstance, setCbInstance ] = useState({})
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    const cbInstance = window.Chargebee.init({
      site: "cmc-dus1-01-test",
      publishableKey: "test_NcuADcmnd4jSpN9Tf0La5Go66LRw8bRB2"
    })

    setCbInstance(cbInstance);

    cbInstance.load("components").then(() => {
      // Mounting Card component
      const cardComponent = cbInstance.createComponent("card");
      // Create card fields
      cardComponent.createField("number").at("#card-number");
      cardComponent.createField("expiry").at("#card-expiry");
      cardComponent.createField("cvv").at("#card-cvc");
      cardComponent.mount();

      const payment = document.querySelector("#payment")

      payment.addEventListener("submit", async (event) => {
        if (loading) return;
        setLoading(true)
        event.preventDefault();
        const error = document.querySelector('#error')
        error.innerHTML = '';
        try {

          const isCardValid = await cardComponent.validateCardDetails()
          if (!isCardValid) {
            throw Error('Card details are invalid');
          }

          const paymentIntentInit = await axios.post("http://localhost:8000/api/generate_payment_intent")

          const additionalData = {
            billingAddress: {
              firstName: "John",
              lastName: "Doe",
              addressLine1: "1600 Amphitheatre Parkway",
              city: "Mountain View",
              state: "California",
              stateCode: "CA",
              zip: "94039",
              countryCode: "US",
            },
            email: chargebee_customer_email,
          }
          const callbacks = {
            change: () => {
              console.log('change')
            },
            success: () => {
              console.log('success')
            },
            error: () => {
              console.log('error')
            },
          }

          const paymentIntentResponse = await cardComponent.authorizeWith3ds(paymentIntentInit.data, additionalData, callbacks)
          console.log('paymentIntentResponse-701563', paymentIntentResponse)

          // Send ajax call to create a subscription or to create a card payment source using the paymentIntent ID
          await axios.post("http://localhost:8000/api/create_subscriptions",
            { paymentIntent: {
              id: paymentIntentResponse.id,
            } }
          )
          error.innerHTML = "SUCCESS";
        } catch (err) {
          error.innerHTML = JSON.stringify(err.message, undefined, 2);
        }
        finally {
          setLoading(false)
        }
      })
    })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title"></h1>
      </header>
      <div>
        <h1>Demo valid card</h1>
        <p>"name": Valid Card</p>
        <p>"number": 4242 4242 4242 4242</p>
        <p>or: 5352 1515 7000 3404</p>
        <p>"exp_month": 12,</p>
        <p>"exp_year": 2029</p>
        <p>"cvv": 100</p>
        <p>"Code 3ds": Checkout1!</p>
      </div>
      <div className="bodyContainer">
        <div className="ex1-wrap">
          <form id="payment">
            <div className="ex1-contain">
              <div className="ex1-fieldset">
                <div className="ex1-field">
                  <input className="ex1-input" type="text" placeholder="John Doe" />
                  <label className="ex1-label">Name on Card</label><i className="ex1-bar"></i>
                </div>
                <div className="ex1-field">
                  <div id="card-number" className="ex1-input"></div>
                  <label className="ex1-label">Card Number</label><i className="ex1-bar"></i>
                </div>
                <div className="ex1-fields">
                  <div className="ex1-field">
                    <div id="card-expiry" className="ex1-input"></div>
                    <label className="ex1-label">Expiry</label><i className="ex1-bar"></i>
                  </div>
                  <div className="ex1-field">
                    <div id="card-cvc" className="ex1-input"></div>
                    <label className="ex1-label">CVC</label><i className="ex1-bar"></i>
                  </div>
                </div>
              </div>
            </div>
            <button id="submit-button" type="submit" className="ex1-button">{loading ? 'Paying' : 'Pay'}</button>
            <div id="error" role="alert"></div>
            <div id="token"></div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default App;
