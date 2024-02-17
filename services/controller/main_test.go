package main

import (
	"context"
	"testing"

	"github.com/Marvin9/dophermal/services/controller/container"
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"go.uber.org/zap"
)

func TestMain(t *testing.T) {
	logger, err := zap.NewDevelopment()

	if err != nil {
		t.Error(err)
	}

	cli, err := container.NewDockerContainerClient(logger)

	if err != nil {
		t.Error(err)
	}

	ctx := context.Background()

	_, err = cli.Run(ctx, "react-nginx", "mayursiinh/react-nginx", container.CoreContainerConfig{
		Port: "8000",
	}, dophermal.ContainerConfigDto{
		Port: 80,
	})

	if err != nil {
		t.Error(err.Error())
		return
	}

	err = cli.Stop(ctx, "react-nginx")

	if err != nil {
		t.Error(err.Error())
		return
	}

	err = cli.Delete(ctx, "react-nginx", container.DeleteOptions{})

	if err != nil {
		t.Error(err.Error())
		return
	}

	cli.Close()
}
