import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { answerExpected, verifiedAnswerExpected } from '../test/expected';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the correct answer', async () => {
      const answer = await appController.getAnswer();
      expect(answer).toStrictEqual(answerExpected);
    });

    it('should verify the correct answer', async () => {
      const verified_answer = await appController.getAnswerVerify();
      expect(verified_answer).toStrictEqual(verifiedAnswerExpected);
    });
  });
});
