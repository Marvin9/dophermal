package queue_test

import (
	"context"
	"testing"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/host"
	"github.com/Marvin9/dophermal/services/controller/queue"
	"github.com/Marvin9/dophermal/services/controller/state"
	"go.uber.org/zap"
)

func TestRunningSingleContainer(t *testing.T) {
	ctx := context.Background()

	logger, err := zap.NewDevelopment()

	if err != nil {
		t.Error(err)
	}

	cli, err := container.NewDockerContainerClient(logger)

	if err != nil {
		t.Error(err)
	}

	inMemoryState := state.NewInMemoryState()

	hostService := host.NewHostService(inMemoryState, logger)

	events := queue.NewEventService(hostService, cli)

	_, err = events.CreateContainerImage(ctx, dophermal.ContainerImageDto{
		Id:        "react-nginx",
		PullImage: "mayursiinh/react-nginx",
		ContainerConfig: dophermal.ContainerConfigDto{
			Port: 80,
		},
	})

	if err != nil {
		t.Error(err)
	}

	port, exists, err := inMemoryState.Get("react-nginx")

	if !exists {
		t.Error("port not stored")
	}

	if err != nil {
		t.Error(err)
	}

	t.Log("container running on port ", port)

	err = events.RemoveContainerImage(ctx, "react-nginx")

	if err != nil {
		t.Error(err)
	}

	_, exists, err = inMemoryState.Get("react-nginx")

	if err != nil {
		t.Error(err)
	}

	if exists {
		t.Error("port not removed")
	}

	isPortInUseList, err := inMemoryState.HasInSet(host.PORTS_IN_USE, port)

	if err != nil {
		t.Error(err)
	}

	if isPortInUseList {
		t.Error("port not removed from used port list")
	}
}

func TestRunningMultiContainer(t *testing.T) {
	ctx := context.Background()

	logger, err := zap.NewDevelopment()

	if err != nil {
		t.Error(err)
	}

	cli, err := container.NewDockerContainerClient(logger)

	if err != nil {
		t.Error(err)
	}

	inMemoryState := state.NewInMemoryState()

	hostService := host.NewHostService(inMemoryState, logger)

	events := queue.NewEventService(hostService, cli)

	_, err = events.CreateContainerImage(ctx, dophermal.ContainerImageDto{
		Id:        "react-nginx",
		PullImage: "mayursiinh/react-nginx",
		ContainerConfig: dophermal.ContainerConfigDto{
			Port: 80,
		},
	})

	if err != nil {
		t.Error(err)
	}

	_, err = events.CreateContainerImage(ctx, dophermal.ContainerImageDto{
		Id:        "react-nginx-2",
		PullImage: "mayursiinh/react-nginx",
		ContainerConfig: dophermal.ContainerConfigDto{
			Port: 80,
		},
	})

	if err != nil {
		t.Error(err)
	}

	port, exists, err := inMemoryState.Get("react-nginx")

	if !exists {
		t.Error("port not stored")
	}

	if err != nil {
		t.Error(err)
	}

	t.Log("container react-nginx running on port ", port)

	port, exists, err = inMemoryState.Get("react-nginx-2")

	if !exists {
		t.Error("port not stored")
	}

	if err != nil {
		t.Error(err)
	}

	t.Log("container react-nginx-2 running on port ", port)

	err = events.RemoveContainerImage(ctx, "react-nginx")

	if err != nil {
		t.Error(err)
	}

	err = events.RemoveContainerImage(ctx, "react-nginx-2")

	if err != nil {
		t.Error(err)
	}
}
