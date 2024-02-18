import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ContainerImage} from './container-image.entity';
import {ContainerImageController} from './container-image.controller';
import {ContainerImageService} from './container-image.service';
import {SqsService} from 'src/sqs/sqs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerImage])],
  controllers: [ContainerImageController],
  providers: [ContainerImageService, SqsService],
})
export class ContainerImageModule {}
