import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppObjectOrientedController } from './object.oriented/app.object.oriented.controller';
import { AppObjectOrientedService } from './object.oriented/app.object.oriented.service';
import { answerExpected, verifiedAnswerExpected } from '../test/expected';

describe('AppController', () => {
  let appController: AppController;
  let appObjectOrientedController: AppObjectOrientedController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController, AppObjectOrientedController],
      providers: [AppService, AppObjectOrientedService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appObjectOrientedController = app.get<AppObjectOrientedController>(AppObjectOrientedController);
  });

  describe('functional', () => {
    it('should return the correct answer', async () => {
      const answer = await appController.getAnswer();
      expect(answer).toStrictEqual(answerExpected);
    });

    it('should verify the correct answer', async () => {
      const verified_answer = await appController.getAnswerVerify();
      expect(verified_answer).toStrictEqual(verifiedAnswerExpected);
    });
  });

  describe('object oriented', () => {
    it('should return the correct answer', async () => {
      const answer = await appObjectOrientedController.getAnswer();
      expect(answer).toStrictEqual(answerExpected);
    });

    it('should verify the correct answer', async () => {
      const verified_answer = await appObjectOrientedController.getAnswerVerify();
      expect(verified_answer).toStrictEqual(verifiedAnswerExpected);
    });
  });
});
