package shared

import (
	"fmt"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
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

func GetDockerHostPublicDns() (*string, error) {
	awsConf := GetAWSConf()

	awsCreds := awsConf.Creds

	sess, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(awsCreds.AccessKeyID, awsCreds.AccessKeySecret, awsCreds.SessionToken),
		Region:      &awsConf.Region,
	})

	if err != nil {
		return aws.String(""), err
	}

	ec2Svc := ec2.New(sess)

	instances, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name: aws.String("tag:Name"),
				Values: aws.StringSlice([]string{
					os.Getenv("DOCKER_HOST_INSTANCE_NAME"),
				}),
			},
		},
	})

	if err != nil {
		return aws.String(""), err
	}

	return instances.Reservations[0].Instances[0].PublicDnsName, nil
}
