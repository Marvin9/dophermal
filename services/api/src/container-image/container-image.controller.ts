import {Body, Controller, Post} from '@nestjs/common';
import {ContainerImageService} from './container-image.service';
import {JWTUser} from 'src/auth/jwt.decorator';
import {ContainerImageDto} from './container-image.dto';
import {JWTExtractDto} from 'src/auth/jwt-dto.dto';
import {User} from 'src/user/user.entity';
import {SqsService} from 'src/sqs/sqs.service';

@Controller('container-image')
export class ContainerImageController {
  constructor(
    private containerImageService: ContainerImageService,
    private readonly sqsSvc: SqsService,
  ) {}

  @Post()
  async create(
    @JWTUser() jwt: JWTExtractDto,
    @Body() containerImage: ContainerImageDto,
  ) {
    const user = new User();
    user.id = jwt.id;
    user.email = jwt.email;
    user.username = jwt.username;

    const newContainerImage = await this.containerImageService.createImage(
      containerImage,
      user,
    );

    this.sqsSvc.sendContainerStartCommand(
      newContainerImage.id,
      newContainerImage.pullImageUrl,
      newContainerImage.containerConfig,
    );

    return newContainerImage;
  }
}
