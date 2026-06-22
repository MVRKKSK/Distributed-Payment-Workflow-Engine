const { v4: uuid } = require("uuid");

const { validatePayment } = require("../services/paymentValidationService");

const { saveTransaction, updateStatus, incrementRetry } = require("../services/transactionService");

const { publishPayment, publishMessage } = require("../services/mqProducerService");
const { processPayment } = require("../processor/paymentProcessor");

async function createPayment(req, res) {

    try {

        console.log("Request Body:", req.body);

        validatePayment(req.body);

        console.log("Validation Passed");

        const payment = {
            transactionId: uuid(),
            customerId: req.body.customerId,
            amount: req.body.amount,
            currency: req.body.currency,
            status: "RECEIVED"
        };

        console.log("Payment Object:", payment);

        await saveTransaction(payment);

        console.log("Saved to DB");
        await publishMessage(
            process.env.AUDIT_QUEUE,
            {
                transactionId:
                    payment.transactionId,

                eventType:
                    "PAYMENT_RECEIVED",

                customerId:
                    payment.customerId,

                amount:
                    payment.amount
            }
        );
        await publishPayment(payment);

        console.log("Published to MQ");



        return res.status(201).json({
            transactionId: payment.transactionId,
            status: payment.status
        });

    } catch (err) {

        console.error("Create Payment Error:", err);

        return res.status(400).json({
            error: err.message
        });
    }
}
async function handlePayment(payment) {

    await updateStatus(
        payment.transactionId,
        "PROCESSING"
    );

    await publishMessage(
        process.env.AUDIT_QUEUE,
        {
            transactionId:
                payment.transactionId,

            eventType:
                "PAYMENT_PROCESSING",

            customerId:
                payment.customerId,

            amount:
                payment.amount
        }
    );

    const result =
        await processPayment(payment);

    if (
        result.destination === "RETRY"
    ) {

        await updateStatus(
            payment.transactionId,
            "RETRYING"
        );

        await incrementRetry(
            payment.transactionId
        );

        await publishMessage(
            process.env.AUDIT_QUEUE,
            {
                transactionId:
                    payment.transactionId,

                eventType:
                    "PAYMENT_RETRYING"
            }
        );

        await publishMessage(
            process.env.RETRY_QUEUE,
            payment
        );

        return;
    }

    if (
        result.destination === "DLQ"
    ) {

        await updateStatus(
            payment.transactionId,
            "FAILED"
        );

        await publishMessage(
            process.env.AUDIT_QUEUE,
            {
                transactionId:
                    payment.transactionId,

                eventType:
                    "PAYMENT_FAILED"
            }
        );

        await publishMessage(
            process.env.DLQ_QUEUE,
            payment
        );

        return;
    }

    await updateStatus(
        payment.transactionId,
        result.status
    );

    await publishMessage(
        process.env.AUDIT_QUEUE,
        {
            transactionId:
                payment.transactionId,

            eventType:
                "PAYMENT_COMPLETED"
        }
    );

    await publishMessage(
        process.env.RESPONSE_QUEUE,
        {
            ...payment,
            status: result.status
        }
    );
}
module.exports = {
    createPayment,
    handlePayment
};