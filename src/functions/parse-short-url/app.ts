import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
    apiGatewayHandler,
    APIGatewayResponse,
    MethodConfiguration
} from "../../utils/apiGatewayHelpers"
import { ShortUrlModel } from '../../models/ShortUrl';
import { ItemNotFound } from '../../utils/apiGatewayResponseTemplates';
import { getSsmAppConfigParameter } from '../../utils/ssmHelper';
import { addShortUrlHistoryParse } from '../../utils/sqsHelpers';

const _ = require('lodash');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const methodConfigs: MethodConfiguration = {
        GET: parseShortUrl,
    }
    return apiGatewayHandler(event, methodConfigs)
}

const parseShortUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayResponse> => {
    const shortUrlKey = _.get(event, 'pathParameters.shortUrlKey', undefined);
    console.debug('parsing: ', shortUrlKey);
    const SHORT_URL_KEY_PREFIX = await getSsmAppConfigParameter('SHORT_URL_KEY_PREFIX');


    const shortUrlItem = await ShortUrlModel.get({id: `${SHORT_URL_KEY_PREFIX}#${shortUrlKey}`});
    if (shortUrlItem) {
        await addShortUrlHistoryParse(shortUrlItem.originalUrl);
        return {
            statusCode: 301,
            headers: {
                Location: shortUrlItem.originalUrl,
            }
        };
    } else {
        return ItemNotFound
    }
}
