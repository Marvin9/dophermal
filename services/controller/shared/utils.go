package shared

import (
	"fmt"
	"net"
	"os"
)

func IsPortAvailable(port string) bool {
	ln, err := net.Listen("tcp", ":"+port)

	if err != nil {
		return false
	}

	defer ln.Close()
	return true
}

func EnsureEnvironmentVariables() {
	checker := func(name string) bool {
		return os.Getenv(name) != ""
	}

	vars := []string{
		"DOCKER_HOST_INSTANCE_NAME",
		"DOCKER_HOST_INSTANCE_PROTOCOL",
		"DOCKER_HOST_INSTANCE_PORT",
		"AWS_ACCESS_KEY_ID",
		"AWS_SECRET_ACCESS_KEY",
		"AWS_SESSION_TOKEN",
		"CONTROLLER_SQS_QUEUE_NAME",
		"STATUS_SQS_QUEUE_NAME",
		"CONTAINER_LOGS_BUCKET_NAME",
		"CONTAINER_LOGS_STREAM_CHUNK_SIZE_IN_BYTES",
	}

	for _, variable := range vars {
		if !checker(variable) {
			panic(fmt.Sprintf("variable %s missing", variable))
		}
	}
}
