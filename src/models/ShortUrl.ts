import dynamoose from '../utils/dynamoose';
import { ShortUrlSchema } from '../schemas/ShortUrlSchema';
import { ShortUrlOriginalUrlMappingSchema } from '../schemas/ShortUrlOriginalUrlMappingSchema';

export const ShortUrlModel = dynamoose.model("ShortUrls", [ShortUrlSchema, ShortUrlOriginalUrlMappingSchema]);
