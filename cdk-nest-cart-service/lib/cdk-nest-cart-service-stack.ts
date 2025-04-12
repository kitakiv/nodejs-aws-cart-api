import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { config } from 'dotenv';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Duration } from 'aws-cdk-lib';
config();

export class CdkNestCartServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'NestJsLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'src/lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        APP_PORT: process.env.APP_PORT || '4000',
        AUTH_USERNAME: process.env.AUTH_USERNAME || 'YourGithubLogin',
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || 'password',
        APP_URL: process.env.APP_URL || 'http://localhost:4000',
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_USERNAME: process.env.DB_USERNAME || 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD || 'password',
        DB_NAME: process.env.DB_NAME || 'postgres',
      },
    });
    const api = new apigateway.RestApi(this, 'NestJsApi', {
      restApiName: 'NestJS Serverless API',
      description: 'Serverless NestJS API with Lambda',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        maxAge: cdk.Duration.days(1),
      },
    });

    const integration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      proxy: true,
      allowTestInvoke: true,
    });

    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.RestApiOrigin(api),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Use predefined cache policy instead of custom one
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy:
          cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(
          this,
          'ResponseHeadersPolicy',
          {
            responseHeadersPolicyName: 'ApiResponsePolicy',
            corsBehavior: {
              accessControlAllowOrigins: ['*'],
              accessControlAllowMethods: [
                'GET',
                'HEAD',
                'OPTIONS',
                'PUT',
                'POST',
                'PATCH',
                'DELETE',
              ],
              accessControlAllowHeaders: [
                'Authorization',
                'Content-Type',
                'X-Api-Key',
                'X-Requested-With',
                'Accept',
                'Origin',
                'Access-Control-Request-Method',
                'Access-Control-Request-Headers',
              ],
              accessControlAllowCredentials: true,
              accessControlExposeHeaders: ['Content-Type', 'Authorization'],
              originOverride: true,
            },
            securityHeadersBehavior: {
              contentSecurityPolicy: {
                contentSecurityPolicy: "default-src 'self'",
                override: true,
              },
              strictTransportSecurity: {
                accessControlMaxAge: Duration.days(2 * 365),
                includeSubdomains: true,
                preload: true,
                override: true,
              },
            },
          },
        ),
      },
      enabled: true,
      httpVersion: cloudfront.HttpVersion.HTTP2,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
