import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'

axios.defaults.headers.post[ 'Content-Type' ] = 'application/x-www-form-urlencoded';

const urlEncode = function (data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && (!(data[ p ] == undefined || data[ p ] == null))) {
      str.push(encodeURIComponent(p) + "=" + (data[ p ] ? encodeURIComponent(data[ p ]) : ""));
    }
  }
  return str.join("&");
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cbInstance: window.Chargebee.init({
        site: "cmc-dus1-01-test",
        publishableKey: "test_NcuADcmnd4jSpN9Tf0La5Go66LRw8bRB2"
      })
    };
  }

  componentDidMount() {
    var payButton = document.getElementById("pay-button");
    var form = document.getElementById("payment-form");
    var errorStack = [];

    window.Frames.init("pk_sbox_hxr5t2lwocnnpfg4nf7ddnspmmi");

    window.Frames.addEventHandler(
      window.Frames.Events.CARD_VALIDATION_CHANGED,
      onCardValidationChanged
    );
    function onCardValidationChanged(event) {
      console.log("CARD_VALIDATION_CHANGED: %o", event);
      payButton.disabled = !window.Frames.isCardValid();
    }

    window.Frames.addEventHandler(
      window.Frames.Events.FRAME_VALIDATION_CHANGED,
      onValidationChanged
    );
    function onValidationChanged(event) {
      console.log("FRAME_VALIDATION_CHANGED: %o", event);

      var errorMessageElement = document.querySelector(".error-message");
      var hasError = !event.isValid && !event.isEmpty;

      if (hasError) {
        errorStack.push(event.element);
      } else {
        errorStack = errorStack.filter(function (element) {
          return element !== event.element;
        });
      }

      var errorMessage = errorStack.length
        ? getErrorMessage(errorStack[errorStack.length - 1])
        : "";
      errorMessageElement.textContent = errorMessage;
    }

    function getErrorMessage(element) {
      var errors = {
        "card-number": "Please enter a valid card number",
        "expiry-date": "Please enter a valid expiry date",
        cvv: "Please enter a valid cvv code",
      };

      return errors[element];
    }

    window.Frames.addEventHandler(
      window.Frames.Events.CARD_TOKENIZATION_FAILED,
      onCardTokenizationFailed
    );
    function onCardTokenizationFailed(error) {
      console.log("CARD_TOKENIZATION_FAILED: %o", error);
      window.Frames.enableSubmitForm();
    }

    window.Frames.addEventHandler(window.Frames.Events.CARD_TOKENIZED, onCardTokenized);
    function onCardTokenized(event) {
      var el = document.querySelector(".success-payment-message");
      el.innerHTML =
        "Card tokenization completed<br>" +
        'Your card token is: <span class="token">' +
        event.token +
        "</span>";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      window.Frames.submitCard();
    });

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title"></h1>
        </header>
        <form
          id="payment-form"
          method="POST"
          action="https://merchant.com/charge-card"
        >
          <div class="one-liner">
            <div class="card-frame"></div>
            <button id="pay-button" disabled>
              PAY GBP 24.99
            </button>
          </div>
          <p class="error-message"></p>
          <p class="success-payment-message"></p>
        </form>
      </div>
    );
  }
}

export default App;
