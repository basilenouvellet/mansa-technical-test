import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { answerExpected, verifiedAnswerExpected } from './expected';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/answer (GET)', () => {
    return request(app.getHttpServer())
      .get('/answer')
      .expect(200)
      .expect(answerExpected);
  });

  it('/answer/verify (GET)', () => {
    return request(app.getHttpServer())
      .get('/answer/verify')
      .expect(200)
      .expect(verifiedAnswerExpected);
  });

  it('/oo/answer (GET)', () => {
    return request(app.getHttpServer())
      .get('/oo/answer')
      .expect(200)
      .expect(answerExpected);
  });

  it('/oo/answer/verify (GET)', () => {
    return request(app.getHttpServer())
      .get('/oo/answer/verify')
      .expect(200)
      .expect(verifiedAnswerExpected);
  });
});
