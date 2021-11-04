import { SQSEvent, SQSRecord } from "aws-lambda"
import { ACTION_GENERATE, ACTION_PARSE } from '../../utils/sqsHelpers';
import { ShortUrlModel } from '../../models/ShortUrl';
import { getSsmAppConfigParameter } from '../../utils/ssmHelper';
import dynamoose from '../../utils/dynamoose';
import { v4 as uuidv4 } from 'uuid';
import { SQSMessageAttributes } from 'aws-lambda/trigger/sqs';

const _ = require('lodash');

interface ShortUrlStatistic {
    generatorCounter: number;
    parserCounter: number
}

export const handler = async (event: SQSEvent): Promise<any> => {
    const records: SQSRecord[] = _.get(event, 'Records', []);

    const statisticByOriginalUrl: { [key: string]: ShortUrlStatistic } = {};
    const ORIGINAL_URL_PREFIX = await getSsmAppConfigParameter('ORIGINAL_URL_PREFIX');
    // const pushedHistories = [];

    for (const record of records) {
        let body;
        try {
            body = getAttributeFromQueueMessage(record)
        } catch (e) {
            console.debug('body not parseable')
            console.error(e);
            continue;
        }
        const originalUrl = body.originalUrl
        const action = body.action
        const timestamp = body.timestamp || new Date().toISOString();
        if (!originalUrl || !action) {
            console.warn('Record is not valid ShortUrlHistory');
            continue;
        }

        // don't implement it for this version
        // const newHistory = {id: body.originalUrl, actionAndTimestamp: `${action}#${timestamp}`}
        // try {
        //     const savedHistory = await ShortUrlHistoryModel.create(newHistory);
        //     pushedHistories.push(savedHistory);
        // } catch (e) {
        //     console.debug('Cannot save shortUrlHistory');
        //     console.error(e)
        //     continue;
        // }

        if (!(originalUrl in statisticByOriginalUrl)) {
            statisticByOriginalUrl[originalUrl] = {generatorCounter: 0, parserCounter: 0}
        }
        if (action === ACTION_GENERATE) {
            statisticByOriginalUrl[originalUrl].generatorCounter++;
        } else if (action === ACTION_PARSE) {
            statisticByOriginalUrl[originalUrl].parserCounter++;
        }
    }

    for (const [originalUrl, statistic] of Object.entries(statisticByOriginalUrl)) {
        await updateShortUrlStatistic(originalUrl, statistic, ORIGINAL_URL_PREFIX);
    }

}

const getBodyFromQueueMessage = (record: SQSRecord): any => {
    const rawBody = _.get(record, 'body', undefined);
    try {
        return JSON.parse(rawBody) as unknown as any;
    } catch (e) {
        console.debug('Message body has invalid JSON format: ', rawBody);
        throw e;
    }
}

const getAttributeFromQueueMessage = (record: SQSRecord): any => {
    const messageAttributes: SQSMessageAttributes = _.get(record, 'messageAttributes', {});
    const attributes: any = {};
    for (const [key, value] of Object.entries(messageAttributes)) {
        attributes[key] = value.stringValue || undefined;
    }
    return attributes;
}

const updateShortUrlStatistic = async (originalUrl: string, statistic: ShortUrlStatistic, ORIGINAL_URL_PREFIX: string) => {
    let savedStatistic = false;
    while (!savedStatistic) {
        const shortUrlItem = await ShortUrlModel.get({id: `${ORIGINAL_URL_PREFIX}#${originalUrl}`});
        if (!shortUrlItem) {
            console.warn(`url not found: ${originalUrl}`);
            return;
        }

        shortUrlItem.statistic.generatorCounter += statistic.generatorCounter;
        shortUrlItem.statistic.parserCounter += statistic.parserCounter;
        const condition = new dynamoose.Condition().where("revision").eq(shortUrlItem.revision);
        try {
            await ShortUrlModel.update({id: shortUrlItem.id}, {
                statistic: shortUrlItem.statistic,
                revision: uuidv4()
            }, {condition});
            savedStatistic = true;
        } catch (e) {
            console.debug('cannot save statistic, retrying...');
            console.error(e);
        }
    }

}
