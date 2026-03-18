import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSubjectDto {
  @ApiProperty({ description: 'ID of the subject to assign' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;
}
