#!/bin/bash

# Run the AWS CLI command to describe the stack and store the output in a variable
stack_description=$(aws cloudformation describe-stacks --stack-name dophermal)

# Extract VPC ID and subnet IDs from the JSON output
vpc_id=$(echo "$stack_description" | jq -r '.Stacks[].Outputs[] | select(.OutputKey == "VPCId").OutputValue')
subnet_us_east_1a=$(echo "$stack_description" | jq -r '.Stacks[].Outputs[] | select(.OutputKey == "PublicSubnetUSEast1a").OutputValue')
subnet_us_east_1b=$(echo "$stack_description" | jq -r '.Stacks[].Outputs[] | select(.OutputKey == "PublicSubnetUSEast1b").OutputValue')

# Define the dynamic VPC section
vpc_section="vpc:
  id: \"$vpc_id\"
  subnets:
    public:
      us-east-1a:
        id: \"$subnet_us_east_1a\"
      us-east-1b:
        id: \"$subnet_us_east_1b\""

# Read original YAML content from foo.yaml
original_yaml=$(<infra/eksctl.yaml)

original_yaml=$(echo "$original_yaml" | awk 'BEGIN {p=1} /^vpc:/{p=0} p; /^$/{p=1}')

# Concatenate the original YAML content and the dynamic VPC section
printf "%s\n\n%s\n" "$original_yaml" "$vpc_section" > infra/eksctl-prod.yaml
