tools-version:
	node -v
	pnpm -v
	sqlite3 --version
	docker --version

clean-local-db:
	rm -rf ./db

local-db:
	sh ./scripts/local-db.sh