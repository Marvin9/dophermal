import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ContainerImage} from './container-image.entity';
import {ContainerImageController} from './container-image.controller';
import {ContainerImageService} from './container-image.service';
import {SqsService} from 'src/sqs/sqs.service';
import {ContainerConfigModule} from 'src/container-config/container-config.module';
import {ContainerConfigService} from 'src/container-config/container-config.service';
import {
  ContainerConfig,
  RepoLevelContainerConfig,
} from 'src/container-config/container-config.entity';
import {ContainerImageStatusSubscriber} from './container-image.subscriber';
import {GithubModule} from 'src/github/github.module';
import {GithubService} from 'src/github/github.service';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ContainerImage]),
    ContainerConfigModule,
    TypeOrmModule.forFeature([ContainerConfig]),
    TypeOrmModule.forFeature([RepoLevelContainerConfig]),
    GithubModule,
  ],
  controllers: [ContainerImageController],
  providers: [
    ContainerImageService,
    SqsService,
    ContainerConfigService,
    ContainerImageStatusSubscriber,
    GithubService,
  ],
})
export class ContainerImageModule {}
