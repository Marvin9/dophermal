import {DescribeInstancesCommand, EC2Client} from '@aws-sdk/client-ec2';
import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AwsService {
  private s3Client: S3Client;
  private ec2Client: EC2Client;
  private logger = new Logger(AwsService.name);

  constructor(private configService: ConfigService) {
    const awsConf = {
      region: configService.get('aws.region'),
      credentials: {
        accessKeyId: configService.get('aws.accessKeyId'),
        secretAccessKey: configService.get('aws.accessKeySecret'),
        sessionToken: configService.get('aws.sessionToken'),
      },
    };

    this.s3Client = new S3Client(awsConf);
    this.ec2Client = new EC2Client(awsConf);
  }

  async getContainerLogs(containerImageId: string) {
    let logs = '';

    try {
      const getCommand = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.configService.get('s3.bucketName'),
          Key: `logs/${containerImageId}`,
        }),
      );

      logs = await getCommand.Body.transformToString();
    } catch (e) {}

    return logs;
  }

  async getEC2InstancePublicDNS() {
    this.logger.log('public dns');
    const ec2InstanceName = this.configService.get(
      'ec2.dockerHostInstanceName',
    );

    const command = new DescribeInstancesCommand({
      Filters: [
        {
          Name: 'tag:Name',
          Values: [ec2InstanceName],
        },
      ],
    });

    const result = await this.ec2Client.send(command);

    return result?.Reservations?.[0].Instances?.[0].PublicDnsName;
  }
}
