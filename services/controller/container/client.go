package container

import (
	"context"

	"github.com/Marvin9/dophermal/services/controller/dophermal"
)

type DeleteOptions struct {
	ForceDeleteContainer bool
}

type ContainerClientInterface interface {
	Run(
		ctx context.Context,
		containerName string,
		pullImage string,
		config CoreContainerConfig,
		upstreamConfig dophermal.ContainerConfigDto,
	) (string, error)

	Stop(ctx context.Context, containerName string) error

	// deletes the container and image
	Delete(ctx context.Context, containerName string, deleteOpts DeleteOptions) error

	Close() error
}
