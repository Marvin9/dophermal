package queue

import (
	"context"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/host"
)

type ListenEvents interface {
	CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) (string, error)
	RemoveContainerImage(ctx context.Context, containerName string) error
}

type PublishEvents interface {
	UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS, port string)
}

type eventService struct {
	hostService     *host.HostService
	containerClient container.ContainerClientInterface
}

func NewEventService(hostService *host.HostService, containerClient container.ContainerClientInterface) ListenEvents {
	return &eventService{
		hostService:     hostService,
		containerClient: containerClient,
	}
}

func (es *eventService) CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) (string, error) {
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

	return hostPort, nil
}

func (es *eventService) RemoveContainerImage(ctx context.Context, containerName string) error {
	if err := es.containerClient.Stop(ctx, containerName); err != nil {
		return err
	}

	if err := es.containerClient.Delete(ctx, containerName, container.DeleteOptions{ForceDeleteContainer: true}); err != nil {
		return err
	}

	return es.hostService.ReleasePort(containerName)
}
