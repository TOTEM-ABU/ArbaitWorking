import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RegionModule } from './region/region.module';
import { SessionModule } from './session/session.module';
import { BrandModule } from './brand/brand.module';
import { SizeModule } from './size/size.module';
import { CapacityModule } from './capacity/capacity.module';
import { ToolModule } from './tool/tool.module';
import { LevelModule } from './level/level.module';
import { ProductModule } from './product/product.module';
import { MasterModule } from './master/master.module';
import { OrderModule } from './order/order.module';
import { CommentModule } from './comment/comment.module';
import { FaqModule } from './faq/faq.module';
import { ContactModule } from './contact/contact.module';
import { GeneralInfoModule } from './general-info/general-info.module';
import { ShowcaseModule } from './showcase/showcase.module';
import { PartnerModule } from './partner/partner.module';
import { MailModule } from './mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterController } from './multer/multer.controller';
import { BasketModule } from './basket/basket.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    RegionModule,
    SessionModule,
    BrandModule,
    SizeModule,
    CapacityModule,
    ToolModule,
    LevelModule,
    ProductModule,
    MasterModule,
    OrderModule,
    CommentModule,
    FaqModule,
    ContactModule,
    GeneralInfoModule,
    ShowcaseModule,
    PartnerModule,
    MailModule,
    JwtModule.register({
      global: true,
      secret: 'soz',
      signOptions: { expiresIn: '60s' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    BasketModule,
  ],
  controllers: [AppController, MulterController],
  providers: [AppService],
})
export class AppModule {}
