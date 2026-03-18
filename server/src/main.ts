import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as fs from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from '../src/comman/interceptors/logging.interceptor';
require('dotenv').config();

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function bootstrap() {
  let app;
  let swaggerUrl: string | undefined;

  // Determine whether to use HTTPS or HTTP
  if (process.env.USE_HTTPS === 'true') {
    const httpsOptions = {
      key: fs.readFileSync('./certificates/localhost-key.pem'),
      cert: fs.readFileSync('./certificates/localhost.pem'),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
    console.log('Running with HTTPS');
  } else {
    app = await NestFactory.create(AppModule);
    console.log('Running with HTTP');
  }

  // Security headers
  app.use(helmet());

  // Graceful shutdown
  app.enableShutdownHooks();

  // Configure CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  app.enableCors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`CORS request from: ${origin}`);
      }
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Swagger setup (non-production only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('InoutPlus')
      .setDescription('The inout API Documentation')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    const port = process.env.PORT ?? 3000;
    const protocol = process.env.USE_HTTPS === 'true' ? 'https' : 'http';
    swaggerUrl = `${protocol}://localhost:${port}/api`;
  }

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  // Print URLs
  const port = process.env.PORT ?? 3000;
  const ip = getLocalIP();
  const protocol = process.env.USE_HTTPS === 'true' ? 'https' : 'http';
  const localUrl = `${protocol}://localhost:${port}`;
  const ipUrl = `${protocol}://${ip}:${port}`;
  console.log(`:) App is running at:`);
  console.log(`   Local:   ${localUrl}`);
  console.log(`   Network: ${ipUrl}`);
  if (swaggerUrl) {
    console.log(`   Swagger: ${swaggerUrl}`);
  }
}
bootstrap();
