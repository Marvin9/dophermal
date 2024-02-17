package shared

import "os"

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
