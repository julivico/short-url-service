import dynamoose from '../utils/dynamoose';

export const ShortUrlHistorySchema = new dynamoose.Schema({
    "id": {
        type: String,
        hashKey: true,
        required: true

    },
    "actionAndTimestamp": {
        type: String,
        required: true,
    },
}, {
    "saveUnknown": [],
    "timestamps": false
});
