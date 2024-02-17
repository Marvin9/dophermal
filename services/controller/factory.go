package main

import (
	"os"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/host"
	"github.com/Marvin9/dophermal/services/controller/queue"
	"github.com/Marvin9/dophermal/services/controller/shared"
	"github.com/Marvin9/dophermal/services/controller/state"
	"go.uber.org/zap"
)

type GlobalServicesFactory struct {
	logger       *zap.Logger
	stateManager state.StateManagerInterface
	hostSvc      *host.HostService
	containerSvc container.ContainerClientInterface
	eventSvc     queue.ListenEvents
	sqsSvc       queue.QueueInterface
}

func NewGlobalServicesFactory() *GlobalServicesFactory {
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
	stateManager := state.NewInMemoryState()

	hostSvc := host.NewHostService(stateManager, logger)

	containerSvc, err := container.NewDockerContainerClient(logger)

	if err != nil {
		logger.Error("error initializing container service")
		panic(err)
	}

	eventSvc := queue.NewEventService(hostSvc, containerSvc)

	sqsSvc, err := queue.NewSqsService(shared.AWSConf{
		Creds:  shared.GetAWSCreds(),
		Region: "us-east-1",
	}, eventSvc, logger, queue.RequiredQueues{
		ControllerQueue: os.Getenv("CONTROLLER_SQS_QUEUE_NAME"),
		StatusQueue:     os.Getenv("STATUS_SQS_QUEUE_NAME"),
	})

	if err != nil {
		logger.Error("error initializing SQS service")
		panic(err)
	}

	return &GlobalServicesFactory{
		logger:       logger,
		stateManager: stateManager,
		hostSvc:      hostSvc,
		containerSvc: containerSvc,
		eventSvc:     eventSvc,
		sqsSvc:       sqsSvc,
	}
}
