import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from "nodemailer";
import { ENV_Nodemailer_HOST, ENV_Nodemailer_ID, ENV_Nodemailer_ID_PASS, ENV_Nodemailer_PORT } from 'src/const/keys';

@Injectable()
export class MailerService {
    private transporter;

    constructor(private readonly configService : ConfigService) {
        this.transporter = nodemailer.createTransport({
          host: configService.get<string>(ENV_Nodemailer_HOST), 
          port: configService.get<number>(Number[ENV_Nodemailer_PORT]),
          secure: false,
          auth: {
            user: configService.get<string>(ENV_Nodemailer_ID),
            pass: configService.get<string>(ENV_Nodemailer_ID_PASS),
          }
        });
      }
    
      async sendMail(email: string) {
        try {

        let token = Math.ceil(Math.random() * 9999);

          await this.transporter.sendMail({
            from: this.configService.get<string>(ENV_Nodemailer_ID), 
            to: email,
            subject: `인증번호`,
            text: `인증번호를 입력해주세요 : ${token}`,
          });
          console.log('메일이 전송되었습니다')
        } catch (error) {
          console.error('메일 전송 중 오류가 발생했습니다:', error);
        }
      }
}
