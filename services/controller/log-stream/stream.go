package logstream

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/Marvin9/dophermal/services/controller/shared"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"go.uber.org/zap"
)

type ContainerLogStreamInterface interface {
	StreamLog(containerName string, log []byte) error
}

type s3LogStream struct {
	logger          *zap.Logger
	StreamChunkSize int
	awsS3Svc        *s3.S3
}

func NewS3LogStream(streamChunkSize int, awsConf shared.AWSConf, logger *zap.Logger) (ContainerLogStreamInterface, error) {
	awsCreds := awsConf.Creds

	awsSession, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(awsCreds.AccessKeyID, awsCreds.AccessKeySecret, awsCreds.SessionToken),
		Region:      &awsConf.Region,
	})

	if err != nil {
		return nil, err
	}

	awsS3Svc := s3.New(awsSession)

	return &s3LogStream{
		logger:          logger,
		StreamChunkSize: streamChunkSize,
		awsS3Svc:        awsS3Svc,
	}, nil
}

func (sl *s3LogStream) generateKey(containerName string) string {
	return "/logs/" + containerName
}

func (sl *s3LogStream) StreamLog(containerName string, log []byte) error {
	existingLogs, err := sl.awsS3Svc.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(shared.GetContainerLogsBucketName()),
		Key:    aws.String(sl.generateKey(containerName)),
	})

	existingLogsStr := ""

	if err != nil {
		sl.logger.Debug("get object error", zap.Error(err), zap.String("container-name", containerName))
	}

	if err == nil {
		defer existingLogs.Body.Close()

		buf := new(bytes.Buffer)

		_, err = buf.ReadFrom(existingLogs.Body)

		if err != nil {
			sl.logger.Error("reading body error", zap.Error(err), zap.String("container-name", containerName))
			return err
		}

		existingLogsStr = buf.String()
	}

	_, err = sl.awsS3Svc.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(shared.GetContainerLogsBucketName()),
		Key:    aws.String(sl.generateKey(containerName)),
		Body:   aws.ReadSeekCloser(strings.NewReader(fmt.Sprintf("%s%s", existingLogsStr, string(log)))),
	})

	if err != nil {
		sl.logger.Error("put body error", zap.Error(err), zap.String("container-name", containerName))
	}

	return err
}
