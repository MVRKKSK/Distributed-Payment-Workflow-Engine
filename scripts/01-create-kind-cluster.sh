#!/bin/bash

kind create cluster \
  --name payment-platform \
  --config ./platform/kind/kind-config.yaml