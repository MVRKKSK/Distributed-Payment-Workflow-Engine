const pool =
    require("../config/db");

async function saveFailedTransaction(
    failed
) {

    await pool.query(
        `
        INSERT INTO
        failed_transactions(
            transaction_id,
            reason
        )
        VALUES($1,$2)
        `,
        [
            failed.transactionId,
            failed.reason
        ]
    );
}

module.exports = {
    saveFailedTransaction
};