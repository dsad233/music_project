import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_S3_REGIOM, ENV_S3_ACCESS_KEY, ENV_S3_SECRET_KEY, ENV_S3_BUCKET_NAME } from 'src/const/keys';

@Injectable()
export class ImageService {
    s3Client : S3Client
    constructor(private readonly configService : ConfigService){
        this.s3Client = new S3Client({
            region : this.configService.get<string>(ENV_S3_REGIOM),
            credentials : {
                accessKeyId : this.configService.get<string>(ENV_S3_ACCESS_KEY),
                secretAccessKey: this.configService.get(ENV_S3_SECRET_KEY)
            }
        })
    }

    async imageUploadS3(fileName : string, file : Express.Multer.File, ext : string){
        const command = new PutObjectCommand({
            Bucket : this.configService.get<string>(ENV_S3_BUCKET_NAME),
            Key : fileName,
            Body : file.buffer,
            ACL : 'public-read',
            ContentType : `image/${ext}`
        });
        await this.s3Client.send(command);

        return `https://s3.${ENV_S3_REGIOM}.amazonaws.com/${ENV_S3_BUCKET_NAME}/${fileName}`;
    }
}
