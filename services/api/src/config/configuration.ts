import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {ConfigService} from '@nestjs/config';

let conf = null;

export const loadEager = async () => {
  const configService = new ConfigService();

  const awsConf = {
    region: configService.get('AWS_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      sessionToken: configService.get('AWS_SESSION_TOKEN'),
    },
  };

  const client = new SecretsManagerClient(awsConf);
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: configService.get('AWS_SECRET_NAME'),
      }),
    );

    const data = JSON.parse(response.SecretString);

    conf = {
      port: parseInt(process.env.PORT, 10) || 3000,
      github: {
        client_id: data.GITHUB_OAUTH_CLIENT_ID,
        client_secret: data.GITHUB_OAUTH_SECRET,
        callback_url: data.GITHUB_OAUTH_CALLBACK_URL,
      },
      database: {
        path: process.env.SQLITE_DATABASE_PATH,
      },
      jwt: {
        secret: data.JWT_SECRET_KEY,
      },
      aws: {
        region: data.AWS_REGION,
        accessKeyId: data.AWS_ACCESS_KEY_ID,
        accessKeySecret: data.AWS_SECRET_ACCESS_KEY,
        sessionToken: data.AWS_SESSION_TOKEN,
      },
      sqs: {
        controllerQueue: data.CONTROLLER_SQS_QUEUE_NAME,
        statusQueue: data.STATUS_SQS_QUEUE_NAME,
        disable: false,
      },
      s3: {
        bucketName: data.CONTAINER_LOGS_BUCKET_NAME,
      },
      ec2: {
        dockerHostInstanceName: data.DOCKER_HOST_INSTANCE_NAME,
      },
    };

    return conf;
  } catch (error) {
    throw error;
  }
};

export default async () => conf || (await loadEager());
