const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { v4: uuid } = require('uuid');

const { logger, ValidationError, ServerError } = require('./utils');
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

  try {
    let data;

    if (!event.queryStringParameters) {
      data = await client.scan({ TableName: tableName }).promise();
    } else {
      data = await client
        .scan({
          FilterExpression: `entity = :entity AND carYear = :carYear AND carMark = :carMark AND id = :id AND passengerAmount = :passengerAmount`,
          ExpressionAttributeValues: JSON.parse(
            JSON.stringify({
              ':entity': 'ride',
              ':carMark': event.queryStringParameters?.carMark,
              ':carYear':
                event.queryStringParameters?.carYear &&
                Number(event.queryStringParameters?.carYear),
              ':id': event.queryStringParameters?.carMark,
              ':passengerAmount': event.queryStringParameters?.carMark
            })
          ),
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
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({
        error: error.message,
        type: error.type,
        errors: error.errors,
        one: undefined
      })
    };
  }
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
  try {
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
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    if (!event.body) {
      throw new ValidationError('You had to specify body');
    }
    const body = JSON.parse(event.body);
    const ride = await createRideContract.validateAsync(body, { abortEarly: false });
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
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    if (!event.body) {
      throw new ValidationError('You had to specify body');
    }
    const body = JSON.parse(event.body);
    let res = [];
    for (const ride of body) {
      const validRide = await createRideContract.validateAsync(ride, { abortEarly: false });
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
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    const data = { text: 'updateOne' };

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    const data = { text: 'updateMany' };

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    const data = { text: 'deleteOne' };

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
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

  try {
    if (event.headers.authorization !== secretToken) {
      throw new ValidationError('Wrong authorization token');
    }
    const data = { text: 'deleteMany' };

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error) {
    console.error(error);
    if (!error.status) {
      if (error.details) {
        error = new ValidationError(error.details);
      } else {
        error = new ServerError(error.message || error);
      }
    }
    return {
      statusCode: error.status,
      body: JSON.stringify({ error: error.message, type: error.type, errors: error.errors })
    };
  }
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
