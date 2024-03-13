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
    const containerImage = new ContainerImage();
    containerImage.id = id;
    containerImage.status = status;
    containerImage.port = port;
    return this.containerImageRepository.save(containerImage);
  }

  batchUpdateImageStatus(id: string[], status: CONTAINER_IMAGE_STATUS) {
    return this.containerImageRepository.update(id, {status});
  }

  isPullRequestActive(repo: string, pullRequestNumber: number, user: User) {
    const query = new ContainerImage();
    query.githubRepoName = repo;
    query.pullRequestNumber = pullRequestNumber;
    query.createdBy = user;

    const queryByStatus = [
      CONTAINER_IMAGE_STATUS.INITIATED,
      CONTAINER_IMAGE_STATUS.IN_PROGRESS,
      CONTAINER_IMAGE_STATUS.RUNNING,
    ].map((status) => {
      query.status = status;
      return query;
    });

    return this.containerImageRepository.exists({where: queryByStatus});
  }

  listByUser(user: User) {
    return this.containerImageRepository.find({
      where: {createdBy: user},
      order: {createdAt: 'desc'},
    });
  }

  listByRepo(user: User, repo: string) {
    return this.containerImageRepository.find({
      where: {createdBy: user, githubRepoName: repo},
      order: {
        createdAt: 'desc',
      },
    });
  }

  getByImageId(user: User, imageId: string) {
    return this.containerImageRepository.findOne({
      where: {
        createdBy: user,
        id: imageId,
      },
    });
  }

  imageIdExists(user: User, imageId: string) {
    return this.containerImageRepository.exists({
      where: {
        createdBy: user,
        id: imageId,
      },
    });
  }

  softDeleteContainerImage(user: User, imageId: string) {
    const containerImage = new ContainerImage();

    containerImage.createdBy = user;
    containerImage.id = imageId;
    containerImage.status = CONTAINER_IMAGE_STATUS.TERMINATED;

    return this.containerImageRepository.save(containerImage);
  }

  getByPullRequest(user: User, repo: string, pr: number) {
    return this.containerImageRepository.find({
      where: {
        createdBy: user,
        githubRepoName: repo,
        pullRequestNumber: pr,
      },
      order: {
        createdAt: 'desc',
      },
    });
  }

  ownershipCheck(user: User, imageId: string) {
    return this.containerImageRepository.exists({
      where: {
        createdBy: user,
        id: imageId,
      },
    });
  }

  pullRequestOwnershipCheck(user: User, repo: string, pr: number) {
    return this.containerImageRepository.exists({
      where: {
        createdBy: user,
        githubRepoName: repo,
        pullRequestNumber: pr,
      },
    });
  }
}
