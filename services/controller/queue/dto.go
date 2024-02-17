package queue

import "github.com/Marvin9/dophermal/services/controller/dophermal"

type ControllerQueueReceiveCommand = string

const (
	CREATE ControllerQueueReceiveCommand = "CREATE"
	REMOVE ControllerQueueReceiveCommand = "REMOVE"
)

type CreateContainerPayload = dophermal.ContainerImageDto

type RemoveContainerPayload struct {
	ContainerName string `json:"containerName"`
}

type ControllerQueueOnReceiveDto struct {
	Command                ControllerQueueReceiveCommand `json:"command"`
	CreateContainerPayload CreateContainerPayload        `json:"createContainerPayload"`
	RemoveContainerPayload RemoveContainerPayload        `json:"removeContainerPayload"`
}

type StatusQueueSendDto struct {
	ContainerName string                           `json:"containerName"`
	Status        dophermal.CONTAINER_IMAGE_STATUS `json:"status"`
	HostPort      string                           `json:"hostPort,omitempty"`
}
