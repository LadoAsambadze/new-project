import { GqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';

export interface GqlContext {
  req: Request;
  res: Response;
}

export function getGqlContext(context: ExecutionContext): GqlContext {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext<GqlContext>();
}

export function getGqlRequest(context: ExecutionContext): Request {
  return getGqlContext(context).req;
}
