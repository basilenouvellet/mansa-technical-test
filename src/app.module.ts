import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppObjectOrientedController } from './object.oriented/app.object.oriented.controller';
import { AppObjectOrientedService } from './object.oriented/app.object.oriented.service';

@Module({
  imports: [],
  controllers: [AppController, AppObjectOrientedController],
  providers: [AppService, AppObjectOrientedService],
})
export class AppModule {}
