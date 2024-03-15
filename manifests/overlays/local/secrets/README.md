create 3 files this directory.

kustomization.yaml
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ./api.yaml
  - ./aws.yaml
```

api.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dophermal-api-secrets
type: Opaque
data:
  GITHUB_OAUTH_CLIENT_ID: 
  GITHUB_OAUTH_SECRET: 
  GITHUB_OAUTH_CALLBACK_URL: 
  SQLITE_DATABASE_PATH: 
  JWT_SECRET_KEY:
```

aws.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dophermal-aws-secrets
type: Opaque
data:
  AWS_REGION: 
  AWS_ACCESS_KEY_ID: 
  AWS_SECRET_ACCESS_KEY: 
  AWS_SESSION_TOKEN: 
  CONTROLLER_SQS_QUEUE_NAME:
  STATUS_SQS_QUEUE_NAME:
  CONTAINER_LOGS_BUCKET_NAME:
  DOCKER_HOST_INSTANCE_NAME:
```

