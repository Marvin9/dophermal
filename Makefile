IAM_ROLE_ARN=arn:aws:iam::590183972435:role/LabRole

tools-version:
	node -v
	pnpm -v
	sqlite3 --version
	docker --version
	go -v

clean-local-db:
	rm -rf ./db

connect-local-db:
	sqlite3 ./db/dophermal.db

local-db:
	sh ./hacks/local-db.sh

build-api:
	cd services/api && pnpm build

build-controller:
	cd services/controller && make build

build-ui:
	cd services/ui && pnpm build

build: build-ui build-api build-controller

prod:
	goreman -set-ports=false start

ssh-ec2:
	ssh -i dophermal.pem ec2-user@$(EC2_PUBLIC_DNS)

local-k3d:
	sh ./hacks/local-k3d.sh

destroy-local-k3d:
	k3d registry delete k3d-registry.localhost
	k3d cluster delete dophermal

manifest-local: clean-local-db local-db
	kubectl apply -k manifests/overlays/local

rm-manifest-local:
	kubectl delete -k manifests/overlays/local

aws-up:
	aws cloudformation create-stack --stack-name dophermal --template-body file:///$(PWD)/infra/bundle.yaml --role-arn ${IAM_ROLE_ARN}

aws-destroy:
	-aws s3 rm s3://dophermal-container-log-dumps/logs --recursive
	aws cloudformation delete-stack --stack-name dophermal

eks-storage-class-addon:
	eksctl create addon --name aws-ebs-csi-driver --cluster dophermal --service-account-role-arn ${IAM_ROLE_ARN} --force

eks-create-cluster:
	# extract vpc info from `aws-up` output
	sh hacks/patch-eksctl-prod-vpc.sh
	eksctl create cluster -f infra/eksctl-prod.yaml

eks-delete-cluster:
	eksctl delete cluster -f infra/eksctl.yaml --disable-nodegroup-eviction
