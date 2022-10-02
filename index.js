const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { v4: uuid } = require('uuid');

const { logger } = require('./utils');
const { createRideContract, updateRideContract } = require('./validation');

const client = new DocumentClient({ region: 'us-east-1', apiVersion: '2012-08-10' });
const tableName = 'ride-service4-customerTestTable2';
const secretToken = 'very-very-secret-token';

const getMany = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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
      .scan({
        FilterExpression: `entity = :entity AND carMark = :carMark`,
        ExpressionAttributeValues: {
          ':entity': event.queryStringParameters?.entity,
          ':id': event.queryStringParameters?.id,
          ':carMark': event.queryStringParameters?.carMark,
          ':carYear': event.queryStringParameters?.carYear
        },
        TableName: tableName
      })
      .promise();
    // data = await client
    //   .query({
    //     TableName: tableName,
    //     KeyConditionExpression: 'entity = :entity and id = :id',
    //     FilterExpression: 'carMark = :carMark and carYear = :carYear',
    //     ExpressionAttributeValues: {
    //       ':entity': {
    //         S: event.queryStringParameters?.entity
    //       },
    //       ':id': {
    //         S: event.queryStringParameters?.id
    //       },
    //       ':carMark': {
    //         S: event.queryStringParameters?.carMark
    //       },
    //       ':carYear': {
    //         N: event.queryStringParameters?.carYear
    //       }
    //     }
    //   })
    //   .promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data })
  };
};
const getOne = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
    method: event.requestContext.http.method,
    queryStringParameters: event.queryStringParameters,
    pathParameters: event.pathParameters,
    body: event.body && JSON.parse(event.body),
    headers: event.headers,
    path: event.requestContext.http.path
  });
  const data = await client
    .query({
      TableName: tableName,
      KeyConditionExpression: '#entity = :entity and #id = :id',
      ExpressionAttributeValues: {
        ':entity': 'ride',
        ':id': event.pathParameters?.id
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

const createOne = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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
const createMany = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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

const updateOne = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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
const updateMany = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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

const deleteOne = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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
const deleteMany = async (event, context) => {
  logger.info({
    awsRequestId: context.awsRequestId,
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
