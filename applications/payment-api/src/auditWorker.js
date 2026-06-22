const { consumeMessages } =
    require("./services/mqConsumerService");

const {
    saveAuditEvent
} = require("./services/auditService.js");

async function handleAuditEvent(event) {

    console.log(
        "AUDIT EVENT RECEIVED"
    );

    console.log(event);

    await saveAuditEvent(event);
}

async function start() {

    console.log(
        "Audit Worker Started"
    );

    process.env.REQUEST_QUEUE =
        process.env.AUDIT_QUEUE;

    consumeMessages(
        handleAuditEvent
    );
}

start();