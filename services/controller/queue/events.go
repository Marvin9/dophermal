package queue

import (
	"context"
	"io"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/host"
	logstream "github.com/Marvin9/dophermal/services/controller/log-stream"
	"go.uber.org/zap"
)

type ListenEvents interface {
	// creates container and provide host-port of "-p <host-port>:<container-port>" when run container
	CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) (string, error)
	RemoveContainerImage(ctx context.Context, containerName string) error
}

type PublishEvents interface {
	UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS, port string) error
}

type eventService struct {
	hostService     *host.HostService
	containerClient container.ContainerClientInterface
	logStreamSvc    logstream.ContainerLogStreamInterface
	logger          *zap.Logger
}

func NewEventService(hostService *host.HostService, containerClient container.ContainerClientInterface, logStreamSvc logstream.ContainerLogStreamInterface, logger *zap.Logger) ListenEvents {
	return &eventService{
		hostService:     hostService,
		containerClient: containerClient,
		logger:          logger,
		logStreamSvc:    logStreamSvc,
	}
}

func (es *eventService) CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) (string, error) {
	// TODO: verify if container already running

	containerName := dto.Id

	hostPort, err := es.hostService.AssignPort(containerName)

	if err != nil {
		return "", err
	}

	_, err = es.containerClient.Run(
		ctx, containerName, dto.PullImage,
		container.CoreContainerConfig{
			Port: hostPort,
		},
		dto.ContainerConfig)

	if err != nil {
		es.hostService.ReleasePort(containerName)
		es.containerClient.Stop(ctx, containerName)
		return "", err
	}

	logsReader, err := es.containerClient.ContainerLogs(ctx, containerName)

	go es.streamContainerLogs(logsReader, containerName, 64)

	if err != nil {
		es.logger.Error("reading container logs", zap.Error(err))
	}

	return hostPort, nil
}

func (es *eventService) streamContainerLogs(reader io.ReadCloser, containerName string, chunkSize int) {
	defer reader.Close()

	for {
		logLine := make([]byte, chunkSize)

		byteCount, err := reader.Read(logLine)

		if byteCount == 0 {
			es.logger.Debug("stream-container-logs", zap.String("closing", containerName))
			return
		}

		if err != nil {
			es.logger.Error("stream-container-logs error", zap.Error(err))
			return
		}

		err = es.logStreamSvc.StreamLog(containerName, logLine)

		if err != nil {
			es.logger.Error("stream-container-logs error", zap.Error(err))
		}
	}
}

func (es *eventService) RemoveContainerImage(ctx context.Context, containerName string) error {
	// TODO: verify if container alredy stopped
	if err := es.containerClient.Stop(ctx, containerName); err != nil {
		return err
	}

	if err := es.containerClient.Delete(ctx, containerName, container.DeleteOptions{ForceDeleteContainer: true}); err != nil {
		return err
	}

	return es.hostService.ReleasePort(containerName)
}
