package main

import (
	"os"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/host"
	logstream "github.com/Marvin9/dophermal/services/controller/log-stream"
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
	logStreamSvc logstream.ContainerLogStreamInterface
}

func newGlobalServicesFactory(ignoreSqs bool) *GlobalServicesFactory {
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

	hostSvc := host.NewHostService(stateManager, logger.Named("host-service"))

	containerSvc, err := container.NewDockerContainerClient(logger.Named("docker-container-client-service"))

	if err != nil {
		logger.Error("error initializing container service")
		panic(err)
	}

	logStreamSvc, err := logstream.NewS3LogStream(shared.GetContainerLogStreamChunkSize(), shared.GetAWSConf(), logger.Named("s3-log-stream"))

	if err != nil {
		logger.Error("error initializing S3 service")
		panic(err)
	}

	eventSvc := queue.NewEventService(hostSvc, containerSvc, logStreamSvc, logger.Named("event-service"))

	var sqsSvc queue.QueueInterface
	if !ignoreSqs {
		sqsSvc, err = queue.NewSqsService(
			shared.GetAWSConf(), eventSvc, logger.Named("sqs-service"),
			queue.RequiredQueues{
				ControllerQueue: os.Getenv("CONTROLLER_SQS_QUEUE_NAME"),
				StatusQueue:     os.Getenv("STATUS_SQS_QUEUE_NAME"),
			})

		if err != nil {
			logger.Error("error initializing SQS service")
			panic(err)
		}
	}

	return &GlobalServicesFactory{
		logger:       logger,
		stateManager: stateManager,
		hostSvc:      hostSvc,
		containerSvc: containerSvc,
		eventSvc:     eventSvc,
		sqsSvc:       sqsSvc,
		logStreamSvc: logStreamSvc,
	}
}

func NewGlobalServicesFactory() *GlobalServicesFactory {
	return newGlobalServicesFactory(false)
}
