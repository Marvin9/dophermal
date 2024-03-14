export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  github: {
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
    client_secret: process.env.GITHUB_OAUTH_SECRET,
    callback_url: process.env.GITHUB_OAUTH_CALLBACK_URL,
  },
  database: {
    path: process.env.SQLITE_DATABASE_PATH,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    accessKeySecret: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
  sqs: {
    controllerQueue: process.env.CONTROLLER_SQS_QUEUE_NAME,
    statusQueue: process.env.STATUS_SQS_QUEUE_NAME,
    disable: false,
  },
  s3: {
    bucketName: process.env.CONTAINER_LOGS_BUCKET_NAME,
  },
  ec2: {
    dockerHostInstanceName: process.env.DOCKER_HOST_EC2_INSTANCE_NAME,
  },
});
