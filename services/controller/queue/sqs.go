package queue

import (
	"context"
	"encoding/json"
	"strings"

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
	eventsSvc ListenEvents

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
	HandleOnReceiveCommand(ctx context.Context) error
	PublishEvents
}

func NewSqsService(awsConf shared.AWSConf, eventsSvc ListenEvents, logger *zap.Logger, queues RequiredQueues) (QueueInterface, error) {
	awsCreds := awsConf.Creds

	awsSession, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(awsCreds.AccessKeyID, awsCreds.AccessKeySecret, awsCreds.SessionToken),
		Region:      &awsConf.Region,
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

	logger.Debug("controller queue", zap.String("url", *controllerQueue.QueueUrl))

	statusQueue, err := awsSqsSvc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queues.StatusQueue,
	})

	if err != nil {
		return nil, err
	}

	logger.Debug("status queue", zap.String("url", *statusQueue.QueueUrl))

	return &sqsService{
		logger:                logger,
		awsSqsSvc:             awsSqsSvc,
		eventsSvc:             eventsSvc,
		controllerSqsQueueUrl: controllerQueue.QueueUrl,
		statusSqsQueueUrl:     statusQueue.QueueUrl,
	}, nil
}

func (ss *sqsService) HandleOnReceiveCommand(ctx context.Context) error {
	ss.logger.Debug("waiting for message")

	output, err := ss.awsSqsSvc.ReceiveMessage(&sqs.ReceiveMessageInput{
		QueueUrl: ss.controllerSqsQueueUrl,
	})

	if err != nil {
		return err
	}

	for _, message := range output.Messages {
		ss.awsSqsSvc.DeleteMessage(&sqs.DeleteMessageInput{
			QueueUrl:      ss.controllerSqsQueueUrl,
			ReceiptHandle: message.ReceiptHandle,
		})

		go func(message *sqs.Message) {
			ss.logger.Debug("message", zap.Any("message-body", message.Body))

			if message.Body == nil {
				ss.logger.Error("empty message body detected")
				return
			}

			receiveMessageDto := ControllerQueueOnReceiveDto{}

			err = json.Unmarshal([]byte(*message.Body), &receiveMessageDto)

			if err != nil {
				ss.logger.Error("error decoding payload", zap.String("message-body", *message.Body))
				return
			}

			command := strings.ToUpper(receiveMessageDto.Command)

			switch command {
			case CREATE:
				containerId := receiveMessageDto.CreateContainerPayload.Id

				ss.handleUpdateContainerStatusError(ss.UpdateContainerStatus(containerId, dophermal.CONTAINER_IMAGE_STATUS__In_Progress, ""))

				hostPort, err := ss.eventsSvc.CreateContainerImage(ctx, receiveMessageDto.CreateContainerPayload)

				if err != nil {
					ss.logger.Error("error creating container", zap.String("container", receiveMessageDto.CreateContainerPayload.Id), zap.String("host-port", hostPort))
					ss.handleUpdateContainerStatusError(ss.UpdateContainerStatus(containerId, dophermal.CONTAINER_IMAGE_STATUS__Error, hostPort))
					return
				}

				ss.handleUpdateContainerStatusError(ss.UpdateContainerStatus(containerId, dophermal.CONTAINER_IMAGE_STATUS__Running, hostPort))
			case REMOVE:
				containerId := receiveMessageDto.RemoveContainerPayload.ContainerName

				ss.handleUpdateContainerStatusError(ss.UpdateContainerStatus(containerId, dophermal.CONTAINER_IMAGE_STATUS__Terminating_In_Progress, ""))

				if err := ss.eventsSvc.RemoveContainerImage(ctx, containerId); err != nil {
					ss.logger.Error("error terminating container", zap.String("container", containerId))
				}

				ss.handleUpdateContainerStatusError(ss.UpdateContainerStatus(containerId, dophermal.CONTAINER_IMAGE_STATUS__Terminated, ""))
			}
		}(message)
	}

	return nil
}

func (ss *sqsService) UpdateContainerStatus(containerName string, status dophermal.CONTAINER_IMAGE_STATUS, hostPort string) error {
	sendMessageDto := StatusQueueSendDto{
		ContainerName: containerName,
		Status:        status,
		HostPort:      hostPort,
	}

	sendMessageBodyBytes, err := json.Marshal(sendMessageDto)

	if err != nil {
		ss.logger.Error("error encoding json", zap.Any("body", sendMessageDto))
		return err
	}

	sendMessageBody := string(sendMessageBodyBytes)

	_, err = ss.awsSqsSvc.SendMessage(&sqs.SendMessageInput{
		QueueUrl:    ss.statusSqsQueueUrl,
		MessageBody: &sendMessageBody,
	})

	return err
}

func (ss *sqsService) handleUpdateContainerStatusError(err error) {
	if err != nil {
		ss.logger.Error("error updating container status", zap.Error(err))
	}
}
