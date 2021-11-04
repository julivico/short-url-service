import { GetParameterResult } from "aws-sdk/clients/ssm";
const _ = require('lodash');
const AWS = require('aws-sdk');
const SSM = new AWS.SSM();

const ENV = process.env.ENV || 'dev';
const APP_CONFIG_PATH = process.env.APP_CONFIG_PATH || 'common';

export const getSsmAppConfig = async (service: string, environment = 'dev'): Promise<any> => {
    const parameter = {
        "Name": `/${environment}/${service}/appConfig`
    };
    try {
        const responseFromSSM: GetParameterResult = await SSM.getParameter(parameter).promise();
        const value = _.get(responseFromSSM, 'Parameter.Value', '')
        return JSON.parse(value);
    } catch (e) {
        console.debug(`Error by getting app config from ssm. Path: ${parameter.Name}`)
        console.error(e);
        throw new Error('Error on getting application configuration from SSM. Please check if the SSM path is configured.');
    }
}

export const getSsmAppConfigParameter = async (parameter: string): Promise<any> => {
    const appConfig = await getSsmAppConfig(APP_CONFIG_PATH, ENV);
    if (!appConfig[parameter] === undefined) {
        console.debug(`Parameter is missing in SSM. service ${APP_CONFIG_PATH}, environment ${ENV}, param: ${parameter}`);
        console.debug('appConfig: ', appConfig);
        throw new Error(`Parameter is missing in SSM`)
    }
    return appConfig[parameter];
}
