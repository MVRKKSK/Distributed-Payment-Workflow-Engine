async function processPayment(payment) {

  if (payment.amount <= 0) {

    return {
      status: "FAILED",
      destination: "DLQ"
    };
  }

  const allowedCurrencies = [
    "USD",
    "EUR",
    "GBP"
  ];

  if (
    !allowedCurrencies.includes(
      payment.currency
    )
  ) {

    return {
      status: "FAILED",
      destination: "DLQ"
    };
  }

  /*
   Simulate temporary gateway issue
  */
  if (
    payment.amount >= 5000 &&
    payment.amount <= 10000
  ) {

    return {
      status: "RETRYING",
      destination: "RETRY"
    };
  }

  /*
   Large transaction review
  */
  if (payment.amount > 10000) {

    return {
      status: "REVIEW_REQUIRED",
      destination: "RESPONSE"
    };
  }

  return {
    status: "COMPLETED",
    destination: "RESPONSE"
  };
}

module.exports = {
  processPayment
};