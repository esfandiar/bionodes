import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
// import * as pulumi from "@pulumi/pulumi";
// import * as mime from "mime";

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

// const amazonLinux = pulumi.output(aws.getAmi({
//     filters: [
//         {
//             name: "name",
//             values: ["amzn2-ami-hvm-*-x86_64-gp2"],
//         },
//         {
//             name: "virtualization-type",
//             values: ["hvm"],
//         },
//     ],
//     mostRecent: true,
//     owners: ["137112412989"], // Amazon
// }, { async: true }));
// const crawler = new aws.ec2.Instance("crawler", {
//     ami: amazonLinux.id,
//     instanceType: "c5.2xlarge",
//     subnetId: "subnet-05292b59",
//     availabilityZone: "us-east-1a",
//     keyName: "bionodes",
//     tags: {
//         Name: "bionodes-crawler",
//     },
// });
export = async () => {
    // VPC
    const vpc = new awsx.ec2.Vpc("vpc", {
        subnets: [{ type: "private" }, { type: "public" }],
    });
    const subnetIds = await vpc.publicSubnetIds;

    // EFS
    const filesystem = new aws.efs.FileSystem("filesystem");
    const targets = [];
    for (let i = 0; i < subnetIds.length; i++) {
        targets.push(
            new aws.efs.MountTarget(`fs-mount-${i}`, {
                fileSystemId: filesystem.id,
                subnetId: subnetIds[i],
                securityGroups: [vpc.vpc.defaultSecurityGroupId],
            })
        );
    }
    const ap = new aws.efs.AccessPoint(
        "ap",
        {
            fileSystemId: filesystem.id,
            posixUser: { uid: 1000, gid: 1000 },
            rootDirectory: {
                path: "/db",
                creationInfo: {
                    ownerGid: 1000,
                    ownerUid: 1000,
                    permissions: "755",
                },
            },
        },
        { dependsOn: targets }
    );

    // ECS Cluster
    const cluster = new awsx.ecs.Cluster("cluster", { vpc: vpc });
    const efsVolumeConfiguration: aws.types.input.ecs.TaskDefinitionVolumeEfsVolumeConfiguration = {
        fileSystemId: filesystem.id,
        authorizationConfig: { accessPointId: ap.id },
        transitEncryption: "ENABLED",
        rootDirectory: "/db",
    };

    // Fargate Task
    const crawler = new awsx.ecs.FargateTaskDefinition("crawler", {
        containers: {
            db: {
                image: "neo4j",
                memory: 1024,
                portMappings: [
                    { hostPort: 7474, containerPort: 7474, protocol: "tcp" },
                    { hostPort: 7687, containerPort: 7687, protocol: "tcp" },
                ],
                environment: [
                    { name: "NEO4J_AUTH", value: "neo4j/bionodes" },
                    {
                        name: "NEO4J_dbms_directories_data",
                        value: "/db/db-data",
                    },
                    {
                        name: "NEO4J_dbms_logs_debug_path",
                        value: "/db/logs/debug.log",
                    },
                ],
                mountPoints: [{ containerPath: "/db", sourceVolume: "efs" }],
                user: "1000:1000",
            },
            bionodesCrawler: {
                image: "887840629137.dkr.ecr.us-east-1.amazonaws.com/bionodes",
                environment: [{ name: "DB_SERVER", value: "localhost" }],
                dependsOn: [{ containerName: "db", condition: "START" }],
                command: ["python", "manage.py", "crawl", "epidemiology"],
                memory: 8000,
            },
        },
        volumes: [{ name: "efs", efsVolumeConfiguration }],
        vpc: vpc,
    });

    const api = new awsx.apigateway.API("bionodes", {
        routes: [
            {
                path: "/crawl",
                method: "GET",
                eventHandler: async (req) => {
                    // Anytime someone hits the /hello endpoint, schedule our task.
                    try {
                        const result = await crawler.run({
                            cluster: cluster,
                            platformVersion: "1.4.0",
                        });
                        return { statusCode: 200, body: "OK" };
                    } catch (ex) {
                        return { statusCode: 400, body: ex };
                    }
                },
            },
        ],
    });
};

exports.websiteUrl = siteBucket.websiteEndpoint; // output the endpoint as a stack output
exports.bucketName = siteBucket.bucket; // create a stack export for bucket name
