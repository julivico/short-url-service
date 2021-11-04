import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
    ApiGatewayError,
    apiGatewayHandler,
    APIGatewayResponse,
    getEventBody,
    MethodConfiguration
} from "../../utils/apiGatewayHelpers"
import { ShortUrlModel } from '../../models/ShortUrl';
import { generateRandomString } from '../../utils/generateRandomString';
import dynamoose from '../../utils/dynamoose';
import { getSsmAppConfigParameter } from '../../utils/ssmHelper';
import { addShortUrlHistoryGenerate } from '../../utils/sqsHelpers';
import { shortUrlGenerator } from '../../utils/utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const methodConfigs: MethodConfiguration = {
        POST: handleGenerateShortUrl,
    }
    return apiGatewayHandler(event, methodConfigs)
}

const handleGenerateShortUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayResponse> => {

    const body = getEventBody(event);
    const {url} = body;

    if (!url) {
        throw new ApiGatewayError(400, 'url is missing');
    }

    const ORIGINAL_URL_PREFIX = await getSsmAppConfigParameter('ORIGINAL_URL_PREFIX');
    const SHORT_URL_KEY_PREFIX = await getSsmAppConfigParameter('SHORT_URL_KEY_PREFIX');
    const MAX_RETRIES = await getSsmAppConfigParameter('MAX_RETRIES');
    const BASE_URL = await getSsmAppConfigParameter('BASE_URL');

    // Check if the original URL already existed in the db
    const shortUrlItem = await ShortUrlModel.get({id: `${ORIGINAL_URL_PREFIX}#${url}`});
    if (shortUrlItem && shortUrlItem.shortUrlKey) {
        await addShortUrlHistoryGenerate(url);
        return {
            statusCode: 200,
            response: {
                shortUrl: shortUrlGenerator(BASE_URL, shortUrlItem.shortUrlKey),
                statistic: {
                    generatorCounter: shortUrlItem.statistic.generatorCounter + 1,
                    parserCounter: shortUrlItem.statistic.parserCounter
                }
            }
        }
    }

    let shortUrlKeyExisted = true;
    let shortUrlGeneratorCounter = 0;
    while (shortUrlKeyExisted) {
        const newShortUrlKey = generateRandomString(8);
        const shortUrlItem = await ShortUrlModel.get({id: `${SHORT_URL_KEY_PREFIX}#${newShortUrlKey}`});
        if (!shortUrlItem) {
            const transactionResponse = await dynamoose.transaction(
                [
                    ShortUrlModel.transaction.create({
                        id: `${ORIGINAL_URL_PREFIX}#${url}`,
                        shortUrlKey: newShortUrlKey,
                        statistic: {generatorCounter: 1, parserCounter: 0}
                    }),
                    ShortUrlModel.transaction.create({
                        id: `${SHORT_URL_KEY_PREFIX}#${newShortUrlKey}`,
                        originalUrl: url,
                    }),
                ]
            )
            const createdShortUrlItem = await ShortUrlModel.get({id: `${ORIGINAL_URL_PREFIX}#${url}`});
            return {
                statusCode: 201,
                response: {
                    shortUrl: shortUrlGenerator(BASE_URL, createdShortUrlItem.shortUrlKey),
                    statistic: createdShortUrlItem.statistic
                }
            }
        }
        shortUrlGeneratorCounter++;
        if (shortUrlGeneratorCounter > MAX_RETRIES) {
            return {
                statusCode: 500,
                response: {
                    message: `Max retries exceeded ${MAX_RETRIES}`
                }
            }
        }
    }
}
