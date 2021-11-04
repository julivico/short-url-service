import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
    ApiGatewayError,
    apiGatewayHandler,
    APIGatewayResponse,
    getEventBody,
    MethodConfiguration
} from "../../utils/apiGatewayHelpers"
import { ShortUrlModel } from '../../models/ShortUrl';
import { ItemNotFound } from '../../utils/apiGatewayResponseTemplates';
import { getSsmAppConfigParameter } from '../../utils/ssmHelper';
import { shortUrlGenerator } from '../../utils/utils';

const _ = require('lodash');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const methodConfigs: MethodConfiguration = {
        POST: handleGetShortUrlInfo,
    }
    return apiGatewayHandler(event, methodConfigs)
}

const handleGetShortUrlInfo = async (event: APIGatewayProxyEvent): Promise<APIGatewayResponse> => {
    const body = getEventBody(event);
    const {url} = body;

    if (!url) {
        throw new ApiGatewayError(400, 'url is missing');
    }

    const originalUrl = url;
    console.debug('getting: ', originalUrl);
    const ORIGINAL_URL_PREFIX = await getSsmAppConfigParameter('ORIGINAL_URL_PREFIX');
    const BASE_URL = await getSsmAppConfigParameter('BASE_URL');

    const shortUrlItem = await ShortUrlModel.get({id: `${ORIGINAL_URL_PREFIX}#${originalUrl}`});
    if (shortUrlItem) {
        return {
            statusCode: 200,
            response: {
                shortUrl: shortUrlGenerator(BASE_URL, shortUrlItem.shortUrlKey),
                statistic: shortUrlItem.statistic
            }
        }
    } else {
        return ItemNotFound
    }
}
