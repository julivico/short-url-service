import dynamoose from '../utils/dynamoose';
import { ShortUrlHistorySchema } from '../schemas/ShortUrlHistorySchema';

export const ShortUrlHistoryModel = dynamoose.model("ShortUrlHistories", [ShortUrlHistorySchema]);
