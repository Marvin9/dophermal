package main

import (
	"os"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		panic(err)
	}

	logger, err := zap.NewProduction()

	if err != nil {
		panic(err)
	}

	if os.Getenv("ENV") == "development" {
		logger, err = zap.NewDevelopment()

		if err != nil {
			panic(err)
		}
	}

	logger.Info("dophermal controller")

	/*
		in memory port manager
		in memory state manager
		connect docker
		on - container-image-create
			extract data - id, pull_image, config

			publish - status-IN_PROGRESS, id
			usePort(id)
			docker run ...<config> pull_image <container-name=id> -> log stream
			releasePort(id) if fail

			publish - status-RUNNING, id

		on - container-image-remove
			extract data - id

			publish - status-TERMINATING_IN_PROGRESS, id
			docker <remove-command>
			releasePort(id)
			publish - status-TERMINATED, id
	*/
}
