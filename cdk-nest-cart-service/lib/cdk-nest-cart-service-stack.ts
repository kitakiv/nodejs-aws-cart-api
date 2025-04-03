import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { config } from 'dotenv';
config();

export class CdkNestCartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'NestJsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        APP_PORT: process.env.APP_PORT || '4000',
        AUTH_USERNAME: process.env.AUTH_USERNAME || 'YourGithubLogin',
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || 'password',
        APP_URL: process.env.APP_URL || 'http://localhost:4000',
      },
    });
    const api = new apigateway.RestApi(this, 'NestJsApi', {
      restApiName: 'NestJS Serverless API',
      description: 'Serverless NestJS API with Lambda',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true
    });
  }
}
