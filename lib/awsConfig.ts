// awsConfig.ts
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_ACCESS_KEY, // Your AWS Access Key
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_SECRET_ACCESS_KEY, // Your AWS Secret Key
  region: process.env.NEXT_PUBLIC_AWA_S3_BUCKET_REGION, // Your AWS Region
});

const s3 = new AWS.S3();

export { s3 };
