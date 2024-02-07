import {ExecutionContext, createParamDecorator} from '@nestjs/common';
import {JWTExtractDto} from './jwt-dto.dto';

export const JWTUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as JWTExtractDto;
  },
);
