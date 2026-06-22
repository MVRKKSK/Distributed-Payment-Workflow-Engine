const mq = require("ibmmq");
require("dotenv").config();

const MQC = mq.MQC;

const cno = new mq.MQCNO();
cno.Options = MQC.MQCNO_CLIENT_BINDING;

const cd = new mq.MQCD();
cd.ChannelName = process.env.MQ_CHANNEL;
cd.ConnectionName = process.env.MQ_CONN_NAME;

cno.ClientConn = cd;

mq.Connx(
    process.env.MQ_QUEUE_MANAGER,
    cno,
    (err, hConn) => {

        if (err) {
            console.log(err);
            return;
        }

        console.log("CONNECTED");

        const od = new mq.MQOD();
        od.ObjectName = process.env.REQUEST_QUEUE;

        mq.Open(
            hConn,
            od,
            MQC.MQOO_INPUT_SHARED,
            (err, hObj) => {

                if (err) {
                    console.log(err);
                    return;
                }

                console.log("QUEUE OPEN");

                try {

                    const mqmd = new mq.MQMD();

                    const gmo = new mq.MQGMO();

                    gmo.Options =
                        MQC.MQGMO_NO_WAIT;

                    const buf =
                        Buffer.alloc(10240);

                    const len =
                        mq.GetSync(
                            hObj,
                            mqmd,
                            gmo,
                            buf
                        );

                    console.log(
                        "MESSAGE LENGTH:",
                        len
                    );

                    console.log(
                        buf
                        .slice(0, len)
                        .toString()
                    );

                } catch (e) {

                    console.log(
                        "GETSYNC ERROR"
                    );

                    console.log(e);
                }
            }
        );
    }
);