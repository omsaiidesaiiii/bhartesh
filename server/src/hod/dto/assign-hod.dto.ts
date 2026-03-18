import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignHodDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    staffId: string;
}
