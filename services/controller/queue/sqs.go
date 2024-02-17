package queue

import (
	"github.com/Marvin9/dophermal/services/controller/dophermal"
	"github.com/Marvin9/dophermal/services/controller/shared"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"go.uber.org/zap"
)

type sqsService struct {
	logger    *zap.Logger
	eventsSvc *eventService

	awsSqsSvc *sqs.SQS

	controllerSqsQueueUrl *string
	statusSqsQueueUrl     *string
}

// SQS queue names
type RequiredQueues struct {
	ControllerQueue string
	StatusQueue     string
}

type QueueInterface interface {
	HandleOnReceiveCommand() error
	PublishEvents
}

func NewSqsService(awsCreds shared.AWSStaticCredentials, eventsSvc *eventService, logger *zap.Logger, queues RequiredQueues) (QueueInterface, error) {
	awsSession, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(awsCreds.AccessKeyID, awsCreds.AccessKeySecret, awsCreds.SessionToken),
	})

	if err != nil {
		return nil, err
	}

	awsSqsSvc := sqs.New(awsSession)

	controllerQueue, err := awsSqsSvc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queues.ControllerQueue,
	})

	if err != nil {
		return nil, err
	}

	statusQueue, err := awsSqsSvc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queues.StatusQueue,
	})

	if err != nil {
		return nil, err
	}

	return &sqsService{
		logger:                logger,
		awsSqsSvc:             awsSqsSvc,
		eventsSvc:             eventsSvc,
		controllerSqsQueueUrl: controllerQueue.QueueUrl,
		statusSqsQueueUrl:     statusQueue.QueueUrl,
	}, nil
}

func (ss *sqsService) HandleOnReceiveCommand() error {
	_, err := ss.awsSqsSvc.ReceiveMessage(&sqs.ReceiveMessageInput{
		QueueUrl: ss.controllerSqsQueueUrl,
	})

	if err != nil {
		return err
	}

	return nil
}

func (ss *sqsService) UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS, port string) {

}
