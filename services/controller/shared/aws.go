package shared

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
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

func GetSession() (*session.Session, error) {
	awsConf := GetAWSConf()
	awsCreds := awsConf.Creds

	return session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(awsCreds.AccessKeyID, awsCreds.AccessKeySecret, awsCreds.SessionToken),
		Region:      &awsConf.Region,
	})
}

func GetDockerHostPublicDns() (string, error) {
	sess, err := GetSession()

	if err != nil {
		return "", err
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
		return "", err
	}

	if instances != nil &&
		instances.Reservations != nil &&
		len(instances.Reservations) > 0 &&
		instances.Reservations[0].Instances != nil &&
		len(instances.Reservations[0].Instances) > 0 {
		dns := *instances.Reservations[0].Instances[0].PublicDnsName
		return dns, nil
	}

	return "", nil
}

func PopulateEnvironmentVariablesFromSecretManager() error {
	secretName := os.Getenv("AWS_SECRET_NAME")

	sess, err := GetSession()

	if err != nil {
		return err
	}

	secretsManagerSvc := secretsmanager.New(sess)

	res, err := secretsManagerSvc.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretName),
	})

	if err != nil {
		return err
	}

	secrets := *res.SecretString

	kv := map[string]string{}

	err = json.Unmarshal([]byte(secrets), &kv)

	if err != nil {
		return err
	}

	for key, value := range kv {
		os.Setenv(key, value)
	}

	return nil
}
