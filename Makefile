tools-version:
	node -v
	pnpm -v
	sqlite3 --version
	docker --version

clean-local-db:
	rm -rf ./db

local-db:
	sh ./scripts/local-db.sh

build-api:
	cd services/api && pnpm build

build-controller:
	cd services/controller && make build

build: build-api build-controller
