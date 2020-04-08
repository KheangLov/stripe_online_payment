// A reference to Stripe.js
let stripe;

const orderData = {
  items: [{ id: "photo-subscription" }],
  currency: "usd"
};

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch("/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(orderData)
})
  .then((result) => result.json())
  .then((data) => setupElements(data))
  .then(({ stripe, card, clientSecret }) => {
    document.querySelector("button").disabled = false;

    // Handle form submission.
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", event => {
      event.preventDefault();
      // Initiate payment when the submit button is clicked
      pay(stripe, card, clientSecret);
    });
  });

// Set up Stripe.js and Elements to use in checkout form
const setupElements = data => {
  stripe = Stripe(data.publishableKey);
  const elements = stripe.elements();
  const style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };

  const card = elements.create("card", { style: style });
  card.mount("#card-element");

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret
  };
};

/*
 * Calls stripe.confirmCardPayment which creates a pop-up modal to
 * prompt the user to enter extra authentication details without leaving your page
 */
const pay = (stripe, card, clientSecret) => {
  changeLoadingState(true);

  // Initiate the payment.
  // If authentication is required, confirmCardPayment will automatically display a modal
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(result => {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment has been processed!
        orderComplete(clientSecret);
      }
    });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
const orderComplete = clientSecret => {
  // Just for the purpose of the sample, show the PaymentIntent response object
  stripe.retrievePaymentIntent(clientSecret).then(result => {
    const paymentIntent = result.paymentIntent;
    const paymentIntentJson = JSON.stringify(paymentIntent, null, 2);
    console.log("Non-JSON:", paymentIntent, "JSON:", paymentIntentJson);
    document.querySelector("#main").style.width = '100%';
    document.querySelector("#result").style.display = 'block';
    let output = `
      <h3>Response Data</h3>
      <table class="table-fill">
        <tbody class="table-hover">
          <tr>
            <th class="text-left">Object</th>
            <td class="text-left">${paymentIntent.object}</td>
          </tr>
          <tr>
            <th class="text-left">Amount</th>
            <td class="text-left">${paymentIntent.amount}</td>
          </tr>
          <tr>
            <th class="text-left">Cancel At</th>
            <td class="text-left">${paymentIntent.canceled_at}</td>
          </tr>
          <tr>
            <th class="text-left">Cancellation Reason</th>
            <td class="text-left">${paymentIntent.cancellation_reason}</td>
          </tr>
          <tr>
            <th class="text-left">Capture Method</th>
            <td class="text-left">${paymentIntent.capture_method}</td>
          </tr>
          <tr>
            <th class="text-left">Client Secret</th>
            <td class="text-left">${paymentIntent.client_secret}</td>
          </tr>
          <tr>
            <th class="text-left">Confirmation Method</th>
            <td class="text-left">${paymentIntent.confirmation_method}</td>
          </tr>
          <tr>
            <th class="text-left">Created</th>
            <td class="text-left">${paymentIntent.created}</td>
          </tr>
          <tr>
            <th class="text-left">Currency</th>
            <td class="text-left">${paymentIntent.currency}</td>
          </tr>
          <tr>
            <th class="text-left">Description</th>
            <td class="text-left">${paymentIntent.description}</td>
          </tr>
          <tr>
            <th class="text-left">Last Payment Error</th>
            <td class="text-left">${paymentIntent.last_payment_error}</td>
          </tr>
          <tr>
            <th class="text-left">Livemode</th>
            <td class="text-left">${paymentIntent.livemode}</td>
          </tr>
          <tr>
            <th class="text-left">Next Action</th>
            <td class="text-left">${paymentIntent.next_action}</td>
          </tr>
          <tr>
            <th class="text-left">Payment Method</th>
            <td class="text-left">${paymentIntent.payment_method}</td>
          </tr>
          <tr>
            <th class="text-left">Payment Method Types</th>
            <td class="text-left">${paymentIntent.payment_method_types}</td>
          </tr>
          <tr>
            <th class="text-left">Receipt Email</th>
            <td class="text-left">${paymentIntent.receipt_email}</td>
          </tr>
          <tr>
            <th class="text-left">Setupo Future Usage</th>
            <td class="text-left">${paymentIntent.setup_future_usage}</td>
          </tr>
          <tr>
            <th class="text-left">Shipping</th>
            <td class="text-left">${paymentIntent.shipping}</td>
          </tr>
          <tr>
            <th class="text-left">Source</th>
            <td class="text-left">${paymentIntent.source}</td>
          </tr>
          <tr>
            <th class="text-left">Status</th>
            <td class="text-left">${paymentIntent.status}</td>
          </tr>
        </tbody>
      </table>`;
    document.querySelector("#result").innerHTML = output;
    document.querySelector(".sr-payment-form").classList.add("hidden");
    document.querySelector("pre").textContent = paymentIntentJson;

    document.querySelector(".sr-result").classList.remove("hidden");
    setTimeout(() => {
      document.querySelector(".sr-result").classList.add("expand");
    }, 200);

    changeLoadingState(false);
  });
};

const showError = errorMsgText => {
  changeLoadingState(false);
  const errorMsg = document.querySelector(".sr-field-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(() => {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
const changeLoadingState = isLoading => {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
