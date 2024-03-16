package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/Marvin9/dophermal/services/controller/shared"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	ctx := context.Background()

	sigs := make(chan os.Signal, 1)
	exit := make(chan bool, 1)

	signal.Notify(sigs, os.Interrupt, syscall.SIGTERM)

	err := godotenv.Load()

	if err != nil {
		fmt.Println(err)
	}

	err = shared.PopulateEnvironmentVariablesFromSecretManager()

	if err != nil {
		fmt.Println(err)
	}

	shared.EnsureEnvironmentVariables()

	svcFactory := NewGlobalServicesFactory()

	svcFactory.logger.Info("dophermal controller running")

	go func() {
		<-sigs

		exit <- true
	}()

	// long-polling SQS
	go func() {
		for {
			err = svcFactory.sqsSvc.HandleOnReceiveCommand(ctx)

			if err != nil {
				svcFactory.logger.Error("error handling SQS message", zap.Error(err))
			}
		}
	}()

	if <-exit {
		svcFactory.logger.Info("exiting dophermal controller")
	}
}
