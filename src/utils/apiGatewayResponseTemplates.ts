import { formatterAPIGatewayResult } from './apiGatewayHelpers';

export const UnknownException = formatterAPIGatewayResult(500, {message: 'unknown exception'});
export const ItemNotFound = formatterAPIGatewayResult(404, {message: 'item not found'});
export const UserInfoInvalid = formatterAPIGatewayResult(400, {message: 'user info invalid'})
export const EventRegisterUserAlreadyRegistered = formatterAPIGatewayResult(409, {message: 'user already registered'});
export const EventRegisterSuccess: any = formatterAPIGatewayResult(200, {message: 'register successfully'});
export const EventUnregisterSuccess: any = formatterAPIGatewayResult(200, {message: 'unregister successfully'});
export const EventUnregisterUserNotRegistered = formatterAPIGatewayResult(409, {message: 'User was not registered'});
