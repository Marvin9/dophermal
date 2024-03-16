create 3 files this directory.

kustomization.yaml
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ./aws.yaml
```

You can generate secret file below by running the command to get the AWS creds from `~/.aws/config`, encode and save in `aws.yaml`

```sh
sh hacks/gen-secrets-file-from-aws-conf.sh
```

aws.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: dophermal
  name: dophermal-aws-secrets
type: Opaque
data:
  AWS_ACCESS_KEY_ID: 
  AWS_SECRET_ACCESS_KEY: 
  AWS_SESSION_TOKEN: 
```

