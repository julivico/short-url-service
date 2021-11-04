import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const _ = require('lodash');


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export const formatterAPIGatewayResult = (statusCode: number, body?: any, headers?: any): APIGatewayProxyResult => {
    let responseHeaders = headers || {};
    responseHeaders = Object.assign(
        responseHeaders,
        {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
        }
    )

    const response: APIGatewayProxyResult = {statusCode, headers: responseHeaders, body: ''};

    if (body) {
        if (typeof body === 'string') {
            response.body = body;

        } else {
            response.body = JSON.stringify(body)
        }
    }

    console.debug('formatterAPIGatewayResult: ', response)
    return response;
}


export interface APIGatewayResponse<T = any> {
    statusCode?: number;
    response?: T;
    headers?: any;
}

export type MethodConfiguration = {
    [key in HttpMethod]?: (event: APIGatewayProxyEvent) => Promise<APIGatewayResponse>;
};

export const apiGatewayHandler = async (event: APIGatewayProxyEvent, methodConfigs: MethodConfiguration): Promise<APIGatewayProxyResult> => {
    try {
        if (event.httpMethod && methodConfigs && event.httpMethod in methodConfigs) {
            const method = methodConfigs[event.httpMethod as HttpMethod];
            const result: APIGatewayResponse = await method(event);
            if (result.statusCode) {
                return formatterAPIGatewayResult(result.statusCode, result.response, result.headers);
            } else {
                return formatterAPIGatewayResult(200, result);
            }
        } else {
            formatterAPIGatewayResult(403, {error: `Not supported method: ${event.httpMethod}`});
        }
    } catch (e) {
        console.error(e);
        if (e.statusCode) {
            return formatterAPIGatewayResult(e.statusCode, {error: e.message});
        }
        return formatterAPIGatewayResult(500, {error: 'Internal error'});
    }
}

export class ApiGatewayError extends Error {
    private readonly statusCode: number

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const getParameterFormEventPathParameter = (event: APIGatewayProxyEvent, parameter: string, defaultValue?: string): string | undefined => {
    return _.get(event, `pathParameters.${parameter}`, defaultValue);
}

export const getTenantIdFromEventPathParameter = (event: APIGatewayProxyEvent): string => {
    const tenantId = getParameterFormEventPathParameter(event, 'id');
    if (tenantId === undefined) {
        throw new ApiGatewayError(400, 'Tenant ID is required');
    }
    return tenantId;
}


export const getEventBody = (event: APIGatewayProxyEvent): any => {
    try {
        return JSON.parse(event.body);
    } catch (e) {
        console.debug('Cannot parse event body');
        console.error(e);
        throw new ApiGatewayError(400, 'Body invalid');
    }
}

