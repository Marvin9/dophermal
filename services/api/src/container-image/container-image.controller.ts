import {Body, Controller, Post} from '@nestjs/common';
import {ContainerImageService} from './container-image.service';
import {JWTUser} from 'src/auth/jwt.decorator';
import {ContainerImageDto} from './container-image.dto';
import {JWTExtractDto} from 'src/auth/jwt-dto.dto';
import {User} from 'src/user/user.entity';

@Controller('container-image')
export class ContainerImageController {
  constructor(private containerImageService: ContainerImageService) {}

  @Post()
  async create(
    @JWTUser() jwt: JWTExtractDto,
    @Body() containerImage: ContainerImageDto,
  ) {
    const user = new User();
    user.id = jwt.id;
    user.email = jwt.email;
    user.username = jwt.username;
    return this.containerImageService.createImage(containerImage, user);
  }
}
