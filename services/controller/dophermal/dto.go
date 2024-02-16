package dophermal

type ContainerConfigDto struct {
	Port        int16             `json:"port"`
	KeyValueEnv map[string]string `json:"keyValueEnv"`
}

type ContainerImageDto struct {
	Id              string             `json:"id"`
	PullImage       string             `json:"pullImage"`
	ContainerConfig ContainerConfigDto `json:""`
}
