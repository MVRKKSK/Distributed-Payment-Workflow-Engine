const pool = require("../database/db");

async function saveTransaction(payment) {

  const query = `
      INSERT INTO transactions
      (
        transaction_id,
        customer_id,
        amount,
        currency,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5)
  `;

  await pool.query(query, [
    payment.transactionId,
    payment.customerId,
    payment.amount,
    payment.currency,
    payment.status
  ]);
}

async function incrementRetry(transactionId){
    await pool.query(`
      UPDATE transactions SET retry_count = retry_count + 1
      WHERE transaction_id = $1
    `, [transactionId]);
}

async function updateStatus(transactionId, status){
    await pool.query(`
      UPDATE transactions
      SET status = $1
      WHERE transaction_id = $2
    `, [status, transactionId]);
}

module.exports = {
  saveTransaction,
  updateStatus,
  incrementRetry
};