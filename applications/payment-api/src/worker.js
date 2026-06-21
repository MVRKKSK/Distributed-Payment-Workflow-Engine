const mq = require("ibmmq");
require("dotenv").config();

const {
    consumeMessages
} = require("./services/mqConsumerService");

const {
    handlePayment
} = require("./controllers/paymentController");

async function start() {

    console.log(
        "Payment Worker Started"
    );

    await consumeMessages(
        async (payment) => {

            console.log(
                "WORKER CALLBACK TRIGGERED"
            );

            console.log(payment);

            await handlePayment(
                payment
            );
        }
    );
}

start();