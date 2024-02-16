package dophermal

type ContainerConfigDto struct {
	Port        int16             `json:"port"`
	KeyValueEnv map[string]string `json:"keyValueEnv"`
}

type ContainerImageDto struct {
	Id              string             `json:"id"`
	PullImage       string             `json:"pullImage"`
	ContainerConfig ContainerConfigDto `json:"containerConfig"`
}

type CONTAINER_IMAGE_STATUS = string

const (
	CONTAINER_IMAGE_STATUS__Initiated               CONTAINER_IMAGE_STATUS = "INITIATED"
	CONTAINER_IMAGE_STATUS__In_Progress             CONTAINER_IMAGE_STATUS = "IN_PROGRESS"
	CONTAINER_IMAGE_STATUS__Running                 CONTAINER_IMAGE_STATUS = "RUNNING"
	CONTAINER_IMAGE_STATUS__Error                   CONTAINER_IMAGE_STATUS = "ERROR"
	CONTAINER_IMAGE_STATUS__Terminating_In_Progress CONTAINER_IMAGE_STATUS = "TERMINATING_IN_PROGRESS"
	CONTAINER_IMAGE_STATUS__Terminated              CONTAINER_IMAGE_STATUS = "TERMINATED"
	CONTAINER_IMAGE_STATUS__Unknown                 CONTAINER_IMAGE_STATUS = "UNKNOWN"
)
