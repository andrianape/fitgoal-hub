import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateVerificationDto {
  @IsBoolean()
  isVerified!: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  verificationNote?: string;
}