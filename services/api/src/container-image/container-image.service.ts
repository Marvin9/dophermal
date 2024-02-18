import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CONTAINER_IMAGE_STATUS, ContainerImage} from './container-image.entity';
import {Repository} from 'typeorm';
import {ContainerImageDto} from './container-image.dto';
import {User} from 'src/user/user.entity';
import {ContainerConfig} from 'src/container-config/container-config.entity';

@Injectable()
export class ContainerImageService {
  constructor(
    @InjectRepository(ContainerImage)
    private containerImageRepository: Repository<ContainerImage>,
  ) {}

  createImage(image: ContainerImageDto, user: User) {
    const containerImage = new ContainerImage();

    containerImage.containerConfig = new ContainerConfig();
    containerImage.containerConfig.id = image.containerConfigurationId;

    containerImage.createdBy = user;

    containerImage.githubRepoName = image.githubRepoName;
    containerImage.pullImageUrl = image.pullImageUrl;
    containerImage.pullRequestNumber = image.pullRequestNumber;

    return this.containerImageRepository.save(containerImage);
  }

  updateImageStatus(id: string, status: CONTAINER_IMAGE_STATUS, port?: number) {
    return this.containerImageRepository.update(id, {
      status,
      port,
    });
  }
}
