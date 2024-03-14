tools-version:
	node -v
	pnpm -v
	sqlite3 --version
	docker --version
	go -v

clean-local-db:
	rm -rf ./db

local-db:
	sh ./scripts/local-db.sh

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
