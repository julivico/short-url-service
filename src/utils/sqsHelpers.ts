// Load the AWS SDK for Node.js
import { SendMessageRequest, SendMessageResult } from 'aws-sdk/clients/sqs';
import { original } from 'dynamoose/dist/Model/defaults';

const AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'eu-central-1'});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const SQS_QUEUE_URL = 'https://sqs.eu-central-1.amazonaws.com/575930553503/ShortUrlHistoryQueue'
export const ACTION_GENERATE = 'GENERATE';
export const ACTION_PARSE = 'PARSE'

export const sendSqsShortUrlHistoryMessage = (originalUrl: string, action: 'GENERATE' | 'PARSE'): Promise<SendMessageResult> => {
    const params: SendMessageRequest = {
        DelaySeconds: 0,
        MessageAttributes: {
            "originalUrl": {
                DataType: "String",
                StringValue: originalUrl
            },
            "action": {
                DataType: "String",
                StringValue: action
            },
            "timestamp": {
                DataType: "String",
                StringValue: new Date().toISOString()
            }
        },
        MessageBody: `Action on ${originalUrl}`,
        QueueUrl: SQS_QUEUE_URL
    };

    return sqs.sendMessage(params).promise();
}


export const addShortUrlHistoryGenerate = (originalUrl: string): Promise<SendMessageResult> => {
    return sendSqsShortUrlHistoryMessage(originalUrl, ACTION_GENERATE);
}

export const addShortUrlHistoryParse = (originalUrl: string): Promise<SendMessageResult> => {
    return sendSqsShortUrlHistoryMessage(originalUrl, ACTION_PARSE);
}
