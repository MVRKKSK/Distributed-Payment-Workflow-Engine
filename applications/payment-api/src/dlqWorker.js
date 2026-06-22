const {
    consumeMessages
} = require("./services/mqConsumerService");

const {
    saveFailedTransaction
} =
require("./services/failedTransactionService");

async function handleFailedPayment(
    payment
) {

    console.log(
        "DLQ MESSAGE RECEIVED"
    );

    console.log(payment);

    await saveFailedTransaction({
        transactionId:
            payment.transactionId,

        reason:
            payment.reason ||
            "Max Retry Limit Reached"
    });
}

async function start() {

    console.log(
        "DLQ Worker Started"
    );

    process.env.REQUEST_QUEUE =
        process.env.DLQ_QUEUE;

    consumeMessages(
        handleFailedPayment
    );
}

start();