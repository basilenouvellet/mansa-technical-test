import { Controller, Get } from '@nestjs/common';
import { AppObjectOrientedService } from './app.object.oriented.service';
import { AnswerDto } from '../dtos';

@Controller('oo')
export class AppObjectOrientedController {
  constructor(private readonly appService: AppObjectOrientedService) {}

  @Get('answer')
  async getAnswer(): Promise<AnswerDto> {
    return await this.appService.getAnswer();
  }

  @Get('answer/verify')
  async getAnswerVerify(): Promise<{ answer: string }> {
    return await this.appService.getAnswerVerify();
  }
}
