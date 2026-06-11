import { Module } from '@nestjs/common';
import { SpacesModule } from '../spaces/spaces.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [SpacesModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
