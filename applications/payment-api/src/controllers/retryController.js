const {
  processRetry
} =
require("../processor/retryProcessor");

const {
  publishMessage
} =
require("../services/mqProducerService");

async function handleRetry(
  payment
){

  const result =
    await processPayment(payment);

  if(
    result.destination ===
    "RETRY"
  ){

    await incrementRetry(
      payment.transactionId
    );

    return;
  }

  if(
    result.destination ===
    "DLQ"
  ){

    await updateStatus(
      payment.transactionId,
      "FAILED"
    );

    await publishMessage(
      process.env.DLQ_QUEUE,
      payment
    );

    return;
  }

  await updateStatus(
    payment.transactionId,
    "COMPLETED"
  );

  await publishMessage(
    process.env.RESPONSE_QUEUE,
    payment
  );
}
module.exports = {
  handleRetry
};