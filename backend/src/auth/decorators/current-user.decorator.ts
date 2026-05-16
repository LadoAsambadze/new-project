import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getGqlContext } from '../../common/gql-context.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const { req } = getGqlContext(context);
    return req.user;
  },
);
