const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { v4: uuid } = require('uuid');
const Joi = require('joi');

const { logger } = require('./utils');
const { createRideContract, updateRideContract } = require('./validation');

const client = new DocumentClient({ region: 'us-east-1', apiVersion: '2012-08-10' });
const tableName = 'ride-service4-customerTestTable2';
const secretToken = 'very-very-secret-token';

const getMany = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  let data;

  if (!event.queryStringParameters) {
    data = await client.scan({ TableName: tableName }).promise();
  } else {
    data = await client
      .query({
        TableName: tableName,
        KeyConditionExpression: 'entity = :entity and id = :id',
        FilterExpression: 'carMark = :carMark and carYear = :carYear',
        ExpressionAttributeValues: {
          ':entity': {
            S: event.queryStringParameters?.entity
          },
          ':id': {
            S: event.queryStringParameters?.id
          },
          ':carMark': {
            S: event.queryStringParameters?.carMark
          },
          ':carYear': {
            N: event.queryStringParameters?.carYear
          }
        }
      })
      .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};
const getOne = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  console.log({
    one: 1,
    two: 2,
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  console.log(await client.get({ TableName: tableName, Key: { entity: 'ride' } }).promise());
  console.log(await client.get({ TableName: tableName, Key: { id: '123' } }).promise());
  console.log(
    await client.get({ TableName: tableName, Key: { entity: 'ride', id: '123' } }).promise()
  );
  console.log(await client.get({ TableName: tableName, Key: { carMark: 'test' } }).promise());
  const data = await client
    .query({
      TableName: tableName,
      KeyConditionExpression: '#entity = :entity and #id = :id',
      ExpressionAttributeValues: {
        ':entity': 'ride',
        ':id': '123'
      },
      ExpressionAttributeNames: {
        '#entity': 'entity',
        '#id': 'id'
      }
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ data: data.Items[0] })
  };
};

const createOne = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  try {
    if (!event.body) {
      throw 'You had to specify body';
    }
    const body = JSON.parse(event.body);
    const ride = await createRideContract.validateAsync(body);
    ride.id = uuid();
    ride.entity = 'ride';
    await client
      .put({
        TableName: tableName,
        Item: ride
      })
      .promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ data: ride })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message ? err.message : err })
    };
  }
};
const createMany = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  try {
    if (!event.body) {
      throw 'You had to specify body';
    }
    const body = JSON.parse(event.body);
    let res = [];
    for (const ride of body) {
      const validRide = await createRideContract.validateAsync(ride);
      validRide.id = uuid();
      validRide.entity = 'ride';
      await client
        .put({
          TableName: tableName,
          Item: validRide
        })
        .promise();
      res.push(validRide);
    }
    return {
      statusCode: 201,
      body: JSON.stringify({ data: res })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message ? err.message : err })
    };
  }
};

const updateOne = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  const data = { text: 'updateOne' };

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};
const updateMany = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  const data = { text: 'updateMany' };

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};

const deleteOne = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  const data = { text: 'deleteOne' };

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};
const deleteMany = async (event) => {
  logger.info({
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  if (event.headers.authorization !== secretToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Wrong authorization token' })
    };
  }

  const data = { text: 'deleteMany' };

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};

module.exports = {
  getOne,
  getMany,
  createOne,
  createMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany
};
