import {
  APIGatewayProxyHandler,
  Context,
  APIGatewayProxyEvent,
} from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import { Server } from 'http';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { eventContext } from 'aws-serverless-express/middleware';

let cachedServer: Server;

async function bootstrapServer(context: Context): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        cors: true,
        logger: process.env.NODE_ENV
          ? ['error', 'warn']
          : ['debug', 'log', 'verbose', 'error', 'warn'],
      },
    );
    app.setGlobalPrefix('api');
    app.use(eventContext());
    app.use(helmet.noSniff());
    app.use(helmet.contentSecurityPolicy());
    app.use(helmet.hidePoweredBy());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
    cachedServer = createServer(expressApp, undefined);
  }
  return cachedServer;
}
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
) => {
  cachedServer = await bootstrapServer(context);
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
