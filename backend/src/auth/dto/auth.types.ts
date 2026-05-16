import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => String)
  role!: string;

  @Field({ nullable: true })
  vendorType?: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken!: string;

  @Field(() => AuthUser)
  user!: AuthUser;
}
