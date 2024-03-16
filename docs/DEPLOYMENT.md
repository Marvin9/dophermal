# Release Docker Images

## Prerequisites

- Docker and Docker Compose
- Dockerhub account

## Steps

1. Change the Docker image to `<your-docker-username>/dophermal-<component>` in [docker-compose.yaml](../docker-compose.yaml).
2. Build and push

```sh
docker compose build
docker compose push
```

# Deploy dophermal to AWS

## Prerequisites

- [Unix System](https://en.wikipedia.org/wiki/Unix)
- AWS Account
- [AWS CLI](https://aws.amazon.com/cli/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [kubectx](https://github.com/ahmetb/kubectx)
- [kustomize](https://kustomize.io/)
- [eksctl](https://eksctl.io/)

## Steps

- Connect AWS CLI with your AWS Account.

- Populate AWS Credentials in secrets.yaml. [Read more](../manifests/base/secrets/README.md)

- Create new secret named `prod/dophermal` in AWS Secrets Manager and populate below values.

```sh
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
CONTROLLER_SQS_QUEUE_NAME=
STATUS_SQS_QUEUE_NAME=
CONTAINER_LOGS_BUCKET_NAME=
DOCKER_HOST_INSTANCE_NAME=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_SECRET=
GITHUB_OAUTH_CALLBACK_URL=
JWT_SECRET_KEY=
```

- Update manifest

Replace images with your image pushed at container registry in [kustomization](../manifests/overlays/eks/kustomization.yaml).

Base64 encode your AWS Secrets Manager key and set in `manifests/base/secrets/aws.yaml`

```sh
echo -n '<key>' | base64
```

aws.yaml
```yaml
...
...
data:
    ...
    AWS_SECRET_NAME: <enocoded-value>
```

- Update Makefile

Set `IAM_ROLE_ARN` in [Makefile](../Makefile) to service account role ARN for EKS and Cloudformation.

- Create EKS cluster. This will take 10-15 minutes.

```sh
make eks-create-cluster
```

- eksctl will populate your kubeconfig to point to EKS. To check, run this

```sh
kubectx
```

- You can create other resources in parallel.

```sh
make aws-up
```

- Check status of EKS stack and our cloudformation stack.

```sh
aws cloudformation describe-stacks --stack-name "dophermal" | grep StackStatus

aws cloudformation describe-stacks --stack-name "eksctl-dophermal-cluster" | grep StackStatus

aws cloudformation describe-stacks --stack-name "eksctl-dophermal-nodegroup-ng-1" | grep StackStatus
```

Proceed when status of all is `CREATE_COMPLETE`

> Note: Do not terminate the `eksctl` command running at `make eks-create-cluster`.

- Create EKS storage addon

```sh
make eks-storage-class-addon
```

- Generate SSL Certificate & Make sure `tls.crt` and `tls.key` is present in root of this project. Then write it to secret file `nginx.yaml`

```sh
kubectl create secret tls nginx-tls-secret --namespace=dophermal --cert=tls.crt --key=tls.key --dry-run=client -o yaml > manifests/base/secrets/nginx.yaml
```

- Apply manifest to cluster

```sh
kubectl apply -k manifests/overlays/eks
```

- Make sure all pods are running.

```sh
kubectl get pods -n dophermal
```

- Get the ExternalIP to access the service.

```sh
kubectl get svc/nginx-service -o json -n dophermal | jq -r '.status.loadBalancer.ingress[0].hostname'
```

- Configure the callback URL to URL from the output above in the Github OAuth

# Destroy deployment

- Delete kubernetes resources

```sh
kubectl delete -k manifests/overlays/eks
```

- Delete EKS cluster

```sh
make eks-delete-cluster
```

- Delete our cloudformation stack.

```sh
make aws-destroy
```

- Ensure none from these cloudformation stack exists

```sh
aws cloudformation describe-stacks --stack-name "dophermal" | grep StackStatus

aws cloudformation describe-stacks --stack-name "eksctl-dophermal-cluster" | grep StackStatus

aws cloudformation describe-stacks --stack-name "eksctl-dophermal-nodegroup-ng-1" | grep StackStatus
```