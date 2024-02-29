package shared

import (
	"fmt"
	"os"
	"strconv"
)

type AWSStaticCredentials struct {
	AccessKeyID     string
	AccessKeySecret string
	SessionToken    string
}

func GetAWSCreds() AWSStaticCredentials {
	return AWSStaticCredentials{
		AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AccessKeySecret: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		SessionToken:    os.Getenv("AWS_SESSION_TOKEN"),
	}
}

type AWSConf struct {
	Region string
	Creds  AWSStaticCredentials
}

func GetAWSConf() AWSConf {
	return AWSConf{
		Creds:  GetAWSCreds(),
		Region: "us-east-1",
	}
}

func GetContainerLogStreamChunkSize() int {
	chunks := os.Getenv("CONTAINER_LOGS_STREAM_CHUNK_SIZE_IN_BYTES")

	if chunks == "" {
		return 1024
	}

	newChunks, err := strconv.Atoi(chunks)

	if err != nil {
		fmt.Print(err.Error() + "\n")
		fmt.Println("defauling CONTAINER_LOGS_STREAM_CHUNK_SIZE_IN_BYTES to 1024")
		return 1024
	}

	return newChunks
}

func GetContainerLogsBucketName() string {
	bucket := os.Getenv("CONTAINER_LOGS_BUCKET_NAME")

	if bucket == "" {
		panic("please provide CONTAINER_LOGS_BUCKET_NAME environment variable")
	}

	return bucket
}
