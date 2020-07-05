const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const mime = require("mime");

// Create an S3 Bucket Policy to allow public read of all objects in bucket
// This reusable function can be pulled out into its own module
function publicReadPolicyForBucket(bucketName: string) {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: ["s3:GetObject"],
                Resource: [
                    `arn:aws:s3:::${bucketName}/*`, // policy refers to bucket name explicitly
                ],
            },
        ],
    });
}

// Create an S3 bucket
let siteBucket = new aws.s3.Bucket("bionodes-ui", {
    website: {
        indexDocument: "index.html",
    },
});

// Set the access policy for the bucket so all objects are readable
let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: siteBucket.bucket, // depends on siteBucket -- see explanation below
    policy: siteBucket.bucket.apply(publicReadPolicyForBucket),
    // transform the siteBucket.bucket output property -- see explanation below
});

exports.websiteUrl = siteBucket.websiteEndpoint; // output the endpoint as a stack output
exports.bucketName = siteBucket.bucket; // create a stack export for bucket name
