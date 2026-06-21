#!/bin/bash

echo "==== Nodes ===="
kubectl get nodes

echo ""
echo "==== Pods ===="
kubectl get pods -n payment-platform

echo ""
echo "==== Services ===="
kubectl get svc -n payment-platform

echo ""
echo "==== StatefulSets ===="
kubectl get statefulsets -n payment-platform