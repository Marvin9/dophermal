# dophermal controller

## Environment Variables

`.env`
```sh
# DOCKER_HOST
ENV=development

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

# see infra/sqs.yaml
CONTROLLER_SQS_QUEUE_NAME=ControllerQueue
STATUS_SQS_QUEUE_NAME=StatusQueue

# see infra/s3.yaml
CONTAINER_LOGS_BUCKET_NAME=dophermal-container-log-dumps
CONTAINER_LOGS_STREAM_CHUNK_SIZE_IN_BYTES=1024
```
