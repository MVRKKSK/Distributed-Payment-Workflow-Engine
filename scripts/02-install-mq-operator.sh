#!/bin/bash

helm repo add ibm-messaging https://ibm-messaging.github.io/mq-helm/

helm repo update

helm install mq-operator \
ibm-messaging/ibm-mq-operator \
--namespace payment-platform