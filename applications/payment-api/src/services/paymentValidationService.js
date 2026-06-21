function validatePayment(payment) {

  if (!payment.customerId)
    throw new Error("customerId required");

  if (!payment.amount)
    throw new Error("amount required");

  if (payment.amount <= 0)
    throw new Error("amount must be greater than zero");

  if (!payment.currency)
    throw new Error("currency required");
}

module.exports = { validatePayment };