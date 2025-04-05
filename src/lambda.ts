import { Handler, Context, APIGatewayProxyEvent } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return createServer(expressApp);
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
