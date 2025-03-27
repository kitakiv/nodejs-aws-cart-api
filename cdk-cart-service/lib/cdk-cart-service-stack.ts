import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { config } from 'dotenv';

config();

export interface RestApiStackProps extends cdk.StackProps {
  env: cdk.Environment;
  lambdaHandler: string;
  lambdaPath: string;
}
export class CdkCartServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    const { lambdaHandler, lambdaPath } = props;

    const nestjsLambda = new lambda.Function(this, 'nestjsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: lambdaHandler,
      code: lambda.Code.fromAsset(lambdaPath),
      functionName: "nestjsLambda",
      logRetention: logs.RetentionDays.FIVE_DAYS,
      timeout: cdk.Duration.seconds(10),
      environment: {
        AUTH_USERNAME: process.env.AUTH_USERNAME || '',
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || '',
      }
    });

    const api = new apigateway.LambdaRestApi(this, 'api', {
      handler: nestjsLambda,
      deployOptions: {
        stageName: 'dev',
      },
      deploy: true,
      proxy: true,
      binaryMediaTypes: ['*/*'],
      restApiName: 'cart-service',
    });
  }
}
