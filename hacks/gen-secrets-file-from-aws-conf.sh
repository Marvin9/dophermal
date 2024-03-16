#!/bin/bash

# Read AWS credentials from ~/.config/aws
aws_access_key_id=`aws configure get aws_access_key_id`
aws_secret_access_key=`aws configure get aws_secret_access_key`
aws_session_token=`aws configure get aws_session_token`
aws_region=`aws configure get region`

# Encode credentials in base64 format
aws_access_key_id_base64=`printf '%s' "$aws_access_key_id" | base64`
aws_secret_access_key_base64=`printf '%s' "$aws_secret_access_key" | base64`
aws_session_token_base64=`printf '%s' "$aws_session_token" | base64`
aws_region_base64=`printf '%s' "$aws_region" | base64`

# Write to the YAML file
cat > manifests/base/secrets/aws.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: dophermal-aws-secrets
  namespace: dophermal
type: Opaque
data:
  AWS_REGION: $aws_region_base64
  AWS_ACCESS_KEY_ID: $aws_access_key_id_base64
  AWS_SECRET_ACCESS_KEY: $aws_secret_access_key_base64
  AWS_SESSION_TOKEN: $aws_session_token_base64
EOF

echo "AWS credentials have been written to manifests/base/secrets/aws.yaml"
