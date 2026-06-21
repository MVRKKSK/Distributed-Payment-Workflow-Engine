const mq = require("ibmmq");
require("dotenv").config();

const MQC = mq.MQC;

function consumeMessages(callback) {

    console.log("consumeMessages called");
    console.log("QM:", process.env.MQ_QUEUE_MANAGER);
    console.log("Channel:", process.env.MQ_CHANNEL);
    console.log("Conn:", process.env.MQ_CONN_NAME);

    const cno = new mq.MQCNO();
    cno.Options = MQC.MQCNO_CLIENT_BINDING;

    const cd = new mq.MQCD();

    cd.ChannelName = process.env.MQ_CHANNEL;
    cd.ConnectionName = process.env.MQ_CONN_NAME;

    cno.ClientConn = cd;

    console.log("Before Connx");

    mq.Connx(
        process.env.MQ_QUEUE_MANAGER,
        cno,
        (err, hConn) => {

            console.log("Inside Connx callback");

            if (err) {
                console.log("Connx Error");
                console.log(err);
                return;
            }

            console.log("Connx Success");

            const od = new mq.MQOD();

            od.ObjectName =
                process.env.REQUEST_QUEUE;

            console.log(
                "Opening Queue:",
                process.env.REQUEST_QUEUE
            );

            mq.Open(
                hConn,
                od,
                MQC.MQOO_INPUT_SHARED,
                (err, hObj) => {

                    if (err) {
                        console.log("MQ Open Error");
                        console.log(err);
                        return;
                    }

                    console.log("MQ Connection Success");
                    console.log("Connected to MQ");

                    receiveLoop(
                        hObj,
                        callback
                    );
                }
            );
        }
    );
}
function receiveLoop(hObj, callback) {

    console.log("Waiting for messages...");

    const mqmd = new mq.MQMD();

    const gmo = new mq.MQGMO();

   gmo.Options =
    MQC.MQGMO_NO_WAIT |
    MQC.MQGMO_CONVERT;

    console.log("BEFORE GET");

    mq.Get(
        hObj,
        mqmd,
        gmo,
        (err, data) => {

            console.log("GET CALLBACK HIT");

            if (err) {

                if (
                    err.mqrc !==
                    MQC.MQRC_NO_MSG_AVAILABLE
                ) {

                    console.log("GET ERROR");
                    console.log(err);
                }

            } else {

                try {

                    const message =
                        data.toString();

                    console.log(
                        "MESSAGE RECEIVED:"
                    );

                    console.log(message);

                    const payment =
                        JSON.parse(message);

                    console.log(
                        "PAYMENT OBJECT:"
                    );

                    console.log(payment);

                    callback(payment);

                } catch(ex) {

                    console.log(
                        "JSON ERROR"
                    );

                    console.log(ex);
                }
            }

            receiveLoop(
                hObj,
                callback
            );
        }
    );
}
module.exports = {
    consumeMessages
};