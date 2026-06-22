const {
    consumeMessages
} = require("./services/mqConsumerService");

const {
    updateStatus,
    incrementRetry
} = require("./services/transactionService");

const {
    publishMessage
} = require("./services/mqProducerService");

const {
    processPayment
} = require("./processor/paymentProcessor");

async function handleRetry(payment) {

    console.log(
        "RETRY WORKER RECEIVED"
    );

    console.log(payment);

    await incrementRetry(
        payment.transactionId
    );

    const result =
        await processPayment(payment);

    if (
        result.destination === "SUCCESS"
    ) {

        await updateStatus(
            payment.transactionId,
            "COMPLETED"
        );

        await publishMessage(
            process.env.RESPONSE_QUEUE,
            {
                ...payment,
                status: "COMPLETED"
            }
        );

        return;
    }

    const retryCount =
        payment.retry_count || 0;

    if (retryCount >= 3) {

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
        "RETRYING"
    );

    await publishMessage(
        process.env.RETRY_QUEUE,
        payment
    );
}

async function start() {

    console.log(
        "Retry Worker Started"
    );

    process.env.REQUEST_QUEUE =
        process.env.RETRY_QUEUE;

    consumeMessages(
        handleRetry
    );
}

start();