# dophermal API

## Environment Variables

`.env`
```sh
PORT=8000

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_SECRET=
GITHUB_OAUTH_CALLBACK_URL=http://localhost:8000/api/auth/callback

SQLITE_DATABASE_PATH=

JWT_SECRET_KEY=local

# see infra/sqs.yaml
CONTROLLER_SQS_QUEUE_NAME=ControllerQueue
STATUS_SQS_QUEUE_NAME=StatusQueue

CONTAINER_LOGS_BUCKET_NAME=dophermal-container-log-dumps
DOCKER_HOST_INSTANCE_NAME=dophermal-docker-host
```