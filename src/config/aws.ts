import {S3Client} from '@aws-sdk/client-s3'
import dotenv = require('dotenv');

dotenv.config()
export const s3Client = new S3Client({
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ""
    },
    region: process.env.BUCKET_REGION || ""
})
