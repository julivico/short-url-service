import dynamoose from '../utils/dynamoose';

export const ShortUrlOriginalUrlMappingSchema = new dynamoose.Schema({
    "id": {
        type: String,
        hashKey: true,
        required: true

    },
    "originalUrl": {
        type: String,
        required: true,
    },
}, {
    "saveUnknown": [],
    "timestamps": true
});
