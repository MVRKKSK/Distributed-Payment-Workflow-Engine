const mq = require("ibmmq");
require("dotenv").config();

const MQC = mq.MQC;

async function publishMessage(queueName, message) {

    console.log("========== MQ PRODUCER ==========");
    console.log("Queue:", queueName);
    console.log("Message:", message);

    return new Promise((resolve, reject) => {

        const cno = new mq.MQCNO();
        cno.Options = MQC.MQCNO_CLIENT_BINDING;

        const cd = new mq.MQCD();

        cd.ChannelName = process.env.MQ_CHANNEL;
        cd.ConnectionName = process.env.MQ_CONN_NAME;

        cno.ClientConn = cd;

        console.log("Connecting to MQ...");

        mq.Connx(
            process.env.MQ_QUEUE_MANAGER,
            cno,
            (err, hConn) => {

                console.log("Inside Connx callback");

                if (err) {
                    console.log("MQ Connection Error");
                    console.log(err);
                    return reject(err);
                }

                console.log("MQ Connected Successfully");

                const od = new mq.MQOD();
                od.ObjectName = queueName;

                console.log("Opening Queue:", queueName);

                mq.Open(
                    hConn,
                    od,
                    MQC.MQOO_OUTPUT,
                    (err, hObj) => {

                        console.log("Inside Open callback");

                        if (err) {
                            console.log("MQ Open Error");
                            console.log(err);
                            return reject(err);
                        }

                        console.log("Queue Opened Successfully");

                        const mqmd = new mq.MQMD();

                        const pmo = new mq.MQPMO();
                        pmo.Options = MQC.MQPMO_NO_SYNCPOINT;

                        const buffer =
                            Buffer.from(
                                JSON.stringify(message)
                            );

                        console.log(
                            "Sending Message:",
                            buffer.toString()
                        );

                        mq.Put(
                            hObj,
                            mqmd,
                            pmo,
                            buffer,
                            (err) => {

                                console.log("Inside Put callback");

                                if (err) {
                                    console.log("MQ Put Error");
                                    console.log(err);
                                    return reject(err);
                                }

                                console.log(
                                    `SUCCESSFULLY PUBLISHED TO ${queueName}`
                                );

                                mq.Close(
                                    hObj,
                                    0,
                                    () => {

                                        console.log(
                                            "Queue Closed"
                                        );

                                        mq.Disc(
                                            hConn,
                                            () => {
                                                console.log(
                                                    "MQ Disconnected"
                                                );
                                            }
                                        );
                                    }
                                );

                                resolve();
                            }
                        );
                    }
                );
            }
        );
    });
}

async function publishPayment(message) {

    return publishMessage(
        process.env.REQUEST_QUEUE,
        message
    );
}

module.exports = {
    publishPayment,
    publishMessage
};