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

@Module({
  imports: [
    TypeOrmModule.forFeature([ContainerImage]),
    ContainerConfigModule,
    TypeOrmModule.forFeature([ContainerConfig]),
    TypeOrmModule.forFeature([RepoLevelContainerConfig]),
  ],
  controllers: [ContainerImageController],
  providers: [
    ContainerImageService,
    SqsService,
    ContainerConfigService,
    ContainerImageStatusSubscriber,
  ],
})
export class ContainerImageModule {}
