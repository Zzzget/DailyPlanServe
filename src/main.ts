import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * 应用入口：创建 Nest 实例、挂载 Swagger 文档、监听端口。
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 构建 OpenAPI 文档元信息（标题、描述、版本、Bearer 鉴权方式）
  const config = new DocumentBuilder()
    .setTitle('Daily Plan API')
    .setDescription('每日计划服务接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Swagger UI 挂在 /api 路径下，/api-json 为原始 JSON
  SwaggerModule.setup('api', app, document);

  // 显式绑定 0.0.0.0，让容器/局域网能通过 IPv4 访问
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
