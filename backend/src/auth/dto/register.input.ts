import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  password!: string;

  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'VENDOR'])
  role?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['DESIGNER', 'VENUE', 'BAND', 'EVENT_MANAGER'])
  vendorType?: string;
}
