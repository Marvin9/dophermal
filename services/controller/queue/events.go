package queue

import (
	"context"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/host"
)

type ListenEvents interface {
	CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) error
	RemoveContainerImage(containerName string)
}

type PublishEvents interface {
	UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS)
}

type Events interface {
	ListenEvents
	PublishEvents
}

type eventService struct {
	hostService     *host.HostService
	containerClient container.ContainerClientInterface
}

func NewEventService(hostService *host.HostService, containerClient container.ContainerClientInterface) Events {
	return &eventService{
		hostService:     hostService,
		containerClient: containerClient,
	}
}

func (es *eventService) CreateContainerImage(ctx context.Context, dto dophermal.ContainerImageDto) error {
	containerName := dto.Id

	hostPort, err := es.hostService.AssignPort(containerName)

	if err != nil {
		return err
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
		return err
	}

	return nil
}

func (es *eventService) RemoveContainerImage(containerName string) {

}

func (es *eventService) UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS) {

}
