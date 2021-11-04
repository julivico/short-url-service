import dynamoose from '../utils/dynamoose';
import { v4 as uuidv4 } from 'uuid';

export const ShortUrlSchema = new dynamoose.Schema({
    "id": {
        type: String,
        hashKey: true,
        required: true

    },
    "shortUrlKey": {
        type: String,
        required: true,
    },
    'statistic': {
        type: Object,
    },
    "revision": {
        type: String,
        rangeKey: true,
        default: uuidv4
    },
}, {
    "saveUnknown": [
        "statistic.**",
    ],
    "timestamps": true
});
