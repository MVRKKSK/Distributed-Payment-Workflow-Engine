const pool =
    require("../database/db");

async function saveAuditEvent(
    event
) {

    await pool.query(
        `
        INSERT INTO audit_events(
            transaction_id,
            event_type,
            details
        )
        VALUES($1,$2,$3)
        `,
        [
            event.transactionId,
            event.eventType,
            JSON.stringify(event)
        ]
    );
}

module.exports = {
    saveAuditEvent
};