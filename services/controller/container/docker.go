package container

import (
	"context"
	"fmt"
	"io"
	"os"
	"strconv"

	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/shared"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	dockercontainer "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"go.uber.org/zap"
)

type dockerClient struct {
	dockerApiClient *client.Client
	logger          *zap.Logger
}

func NewDockerContainerClient(logger *zap.Logger) (ContainerClientInterface, error) {
	dockerHostPublicDns, err := shared.GetDockerHostPublicDns()

	opts := []client.Opt{
		client.FromEnv,
	}

	if err != nil || dockerHostPublicDns == nil || *dockerHostPublicDns == "" {
		if dockerHostPublicDns == nil {
			logger.Info("not ec2 instance for docker host found")
		} else {
			logger.Error("ec2 instance for docker host error", zap.Error(err))
		}
	} else {
		dockerHostPublicDnsWithProtocol := fmt.Sprintf("%s://%s:%s", os.Getenv("DOCKER_HOST_INSTANCE_PROTOCOL"), *dockerHostPublicDns, os.Getenv("DOCKER_HOST_INSTANCE_PORT"))

		logger.Debug("docker host public dns", zap.String("dns", dockerHostPublicDnsWithProtocol))

		opts = append(opts, client.WithHost(dockerHostPublicDnsWithProtocol))
	}

	dockerApiClient, err := client.NewClientWithOpts(opts...)

	if err != nil {
		return nil, err
	}

	ping, err := dockerApiClient.Ping(context.Background())

	if err != nil {
		return nil, err
	}

	logger.Info("docker client connected successfully.", zap.String("api-version", ping.APIVersion))

	return &dockerClient{
		dockerApiClient: dockerApiClient,
		logger:          logger,
	}, nil
}

func (dc *dockerClient) Run(ctx context.Context, containerName string, pullImage string, config CoreContainerConfig, upstreamConfig dophermal.ContainerConfigDto) (string, error) {
	dc.logger.Debug("running image", zap.String("pullImage", pullImage))

	reader, err := dc.dockerApiClient.ImagePull(ctx, pullImage, types.ImagePullOptions{})

	if err != nil {
		return "", err
	}

	defer reader.Close()

	io.Copy(io.Discard, reader)

	upstreamConfigPort, err := nat.NewPort("tcp", strconv.Itoa(int(upstreamConfig.Port)))

	if err != nil {
		return "", err
	}

	container, err := dc.dockerApiClient.ContainerCreate(ctx, &container.Config{
		Image: pullImage,
		Tty:   true,
		Env:   upstreamConfig.GetRawEnv(),
	}, &dockercontainer.HostConfig{PortBindings: nat.PortMap{
		upstreamConfigPort: []nat.PortBinding{
			{
				HostPort: config.Port,
			},
		},
	}}, nil, nil, containerName)

	if err != nil {
		return "", err
	}

	dc.logger.Debug("container created", zap.String("container-id", container.ID))

	err = dc.dockerApiClient.ContainerStart(ctx, container.ID, dockercontainer.StartOptions{})

	if err != nil {
		return "", err
	}

	return container.ID, nil
}

func (dc *dockerClient) Stop(ctx context.Context, containerName string) error {
	dc.logger.Debug("container stop", zap.String("container-name", containerName))

	return dc.dockerApiClient.ContainerStop(ctx, containerName, dockercontainer.StopOptions{})
}

func (dc *dockerClient) ContainerLogs(ctx context.Context, containerId string) (io.ReadCloser, error) {
	dc.logger.Debug("container logs", zap.String("contaienr-id", containerId))

	reader, err := dc.dockerApiClient.ContainerLogs(ctx, containerId, dockercontainer.LogsOptions{
		Follow:     true,
		ShowStdout: true,
		ShowStderr: true,
	})

	if err != nil {
		return reader, err
	}

	return reader, nil
}

func (dc *dockerClient) Delete(ctx context.Context, containerName string, opts DeleteOptions) error {
	dc.logger.Debug("container remove", zap.String("container-name", containerName))

	containerData, err := dc.dockerApiClient.ContainerInspect(ctx, containerName)

	if err != nil {
		return err
	}

	if err = dc.dockerApiClient.ContainerRemove(ctx, containerName, dockercontainer.RemoveOptions{
		Force: opts.ForceDeleteContainer,
	}); err != nil {
		return err
	}

	containers, err := dc.dockerApiClient.ContainerList(ctx, dockercontainer.ListOptions{})

	isImageBeingUsed := false
	for _, container := range containers {
		if container.Image == containerData.Config.Image {
			isImageBeingUsed = true
			break
		}
	}

	if !isImageBeingUsed {
		_, err = dc.dockerApiClient.ImageRemove(ctx, containerData.Image, types.ImageRemoveOptions{})
	}

	if err != nil {
		return err
	}

	return nil
}

func (dc *dockerClient) Close() error {
	return dc.dockerApiClient.Close()
}
