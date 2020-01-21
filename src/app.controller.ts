import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AnswerDto } from './dtos';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('answer')
  async getAnswer(): Promise<AnswerDto> {
    return await this.appService.getAnswer();
  }

  @Get('answer/verify')
  async getAnswerVerify(): Promise<{ 'answer': string }> {
    return await this.appService.getAnswerVerify();
  }
}
