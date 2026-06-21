const {
  processPayment
} = require("./paymentProcessor");

async function processRetry(
  payment
){

  return await processPayment(
    payment
  );
}

module.exports = {
  processRetry
};