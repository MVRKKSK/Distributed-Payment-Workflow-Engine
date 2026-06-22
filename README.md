# Payment Processing Platform

A cloud-native, event-driven payment processing platform built using Node.js, IBM MQ, PostgreSQL, Docker, and Kubernetes. The platform simulates enterprise payment processing workflows through asynchronous messaging, transaction persistence, status tracking, retry handling, and scalable microservice deployment.

---

# Project Overview

This implementation provides:

* RESTful Payment API built with Node.js and Express
* IBM MQ for asynchronous message processing
* PostgreSQL transaction persistence
* Payment Worker for background processing
* Kubernetes deployment using Kind
* Dockerized microservices
* Request/Response queue architecture
* Retry and Dead Letter Queue framework
* Audit logging framework
* Enterprise-grade event-driven design

---

# Architecture

```text
                    ┌─────────────────┐
                    │     Client      │
                    │   Postman/API   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Payment API   │
                    │   Node.js       │
                    └────────┬────────┘
                             │
                             ▼
                    PAYMENT.REQUEST
                             │
                             ▼
                    ┌─────────────────┐
                    │ Payment Worker  │
                    │ MQ Consumer     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     PAYMENT.RESPONSE   PAYMENT.RETRY   PAYMENT.DLQ

                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │ Transactions DB │
                    └─────────────────┘
```

---

# Technology Stack

## Backend

* Node.js
* Express.js
* IBM MQ Node.js Client
* PostgreSQL
* UUID

## Messaging

* IBM MQ 9.4
* Request Queue
* Response Queue
* Retry Queue
* Dead Letter Queue
* Audit Queue

## Containerization

* Docker
* Docker Compose

## Orchestration

* Kubernetes
* Kind Cluster
* IBM MQ Operator

---

# Project Structure

```text
payment-processing-platform/

├── applications
│   └── payment-api
│       ├── src
│       │   ├── controllers
│       │   ├── routes
│       │   ├── services
│       │   ├── processor
│       │   ├── worker.js
│       │   ├── auditWorker.js
│       │   ├── retryWorker.js
│       │   └── dlqWorker.js
│       │
│       ├── Dockerfile
│       ├── Dockerfile.worker
│       ├── Dockerfile.audit
│       ├── package.json
│       └── .env
│
├── kubernetes
│   ├── namespaces
│   ├── deployments
│   ├── services
│   └── postgres
│
├── ibm-mq
│   ├── queue-manager.yaml
│   ├── mqsc
│   └── queues
│
└── README.md
```

---

# IBM MQ Configuration

## Queue Manager

```text
Queue Manager : PAYMENTQM
Channel       : PAYMENT.SVRCONN
Transport     : TCP
Port          : 1414
```

## Queues

### Request Queue

```text
PAYMENT.REQUEST
```

Receives newly submitted payment requests.

### Response Queue

```text
PAYMENT.RESPONSE
```

Stores successfully processed payments.

### Retry Queue

```text
PAYMENT.RETRY
```

Stores transient processing failures for reprocessing.

### Dead Letter Queue

```text
PAYMENT.DLQ
```

Stores permanently failed transactions.

### Audit Queue

```text
AUDIT.LOG
```

Stores audit events and transaction logs.

---

# Database Schema

## Transactions Table

```sql
CREATE TABLE transactions(
    transaction_id UUID PRIMARY KEY,
    customer_id VARCHAR(50),
    amount NUMERIC(12,2),
    currency VARCHAR(10),
    status VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Payment Lifecycle

## Step 1

Client submits payment.

```http
POST /api/payments
```

Example:

```json
{
  "customerId": "CUST1001",
  "amount": 500,
  "currency": "USD"
}
```

---

## Step 2

Payment API:

* Validates request
* Generates transaction ID
* Persists transaction
* Publishes message to PAYMENT.REQUEST

---

## Step 3

Payment Worker:

* Consumes PAYMENT.REQUEST
* Updates status to PROCESSING
* Executes payment logic
* Routes transaction

Possible outcomes:

```text
COMPLETED
RETRYING
FAILED
REVIEW_REQUIRED
```

---

## Step 4

Response message published.

```text
PAYMENT.RESPONSE
```

---

## Step 5

Transaction status updated in PostgreSQL.

---

# Kubernetes Deployment

## Namespace

```bash
kubectl create namespace payment-platform
```

## Deploy PostgreSQL

```bash
kubectl apply -f postgres-deployment.yaml
```

## Deploy IBM MQ

```bash
kubectl apply -f queuemanager.yaml
```

## Deploy Payment API

```bash
kubectl apply -f payment-api-deployment.yaml
```

## Deploy Payment Worker

```bash
kubectl apply -f payment-worker-deployment.yaml
```

---

# Monitoring

View Pods

```bash
kubectl get pods -n payment-platform
```

View Services

```bash
kubectl get svc -n payment-platform
```

View Logs

```bash
kubectl logs deployment/payment-api -n payment-platform

kubectl logs deployment/payment-worker -n payment-platform
```

---

# Example Transaction Flow

```json
{
  "transactionId": "47c37de2-1bdb-43bb-b71a-e8cae702be51",
  "customerId": "CUST1006",
  "amount": 1152,
  "currency": "USD",
  "status": "COMPLETED"
}
```

Stored in PostgreSQL:

```text
transaction_id                         status
----------------------------------------------
47c37de2-1bdb-43bb-b71a-e8cae702be51   COMPLETED
```

---

# Future Enhancements

* TLS-secured IBM MQ communication
* Mutual TLS authentication
* Retry Worker deployment
* Dead Letter Queue processing
* Fraud Detection Service
* Audit Worker deployment
* Prometheus Monitoring
* Grafana Dashboards
* OpenAPI/Swagger Documentation
* IBM MQ Native HA
* CI/CD Pipeline using GitHub Actions

---

# Key Features

* Event-driven architecture
* Asynchronous payment processing
* Message-based service communication
* Containerized microservices
* Kubernetes-native deployment
* Persistent transaction storage
* Enterprise messaging with IBM MQ
* Scalable worker architecture

---

# Author

Kautilya Miryala

Enterprise Payment Processing Platform built using IBM MQ, Kubernetes, PostgreSQL, and Node.js.
