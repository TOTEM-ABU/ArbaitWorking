import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppUpdate } from './tg.update';
import { OrderService } from './orderBot.service';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '7640013947:AAHWQ2ALhm8xS8DGPK4gjETHwj03E-xCFyE',
    }),
    TgModule,
  ],
  providers: [AppUpdate, OrderService],
})
export class TgModule {}
