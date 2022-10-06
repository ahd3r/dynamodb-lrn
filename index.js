const { DocumentClient } = require('aws-sdk/clients/dynamodb');

const { logger, ValidationError, ServerError } = require('./utils');
const { createRideContract, updateRideContract } = require('./validation');

const client = new DocumentClient({ region: 'us-east-1', apiVersion: '2012-08-10' });
const tableName = 'ride-service5-customerTestTable3';
const secretToken = 'very-very-secret-token';

/**
 * scan - done
 * query - done
 * get - done
 * batchGet - done
 * batchWrite - done
 *  create - done
 *  update - done
 *  delete - done
 * update - done
 * put
 *  create - done
 *  update - done
 *  add - ?
 * delete - done
 */

// TODO improve
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

    const attrVal = JSON.parse(
      JSON.stringify({
        ':entity': 'ride',
        ':carMark': event.queryStringParameters?.carMark,
        ':carYear':
          event.queryStringParameters?.carYear && Number(event.queryStringParameters?.carYear),
        ':created': event.queryStringParameters?.id,
        ':passengerAmount':
          event.queryStringParameters?.passengerAmount &&
          Number(event.queryStringParameters?.passengerAmount)
      })
    );
    data = await client
      .scan({
        FilterExpression: Object.keys(attrVal)
          .map((val) => `${val.slice(1)} = ${val}`)
          .join(' AND '),
        ExpressionAttributeValues: attrVal,
        TableName: tableName
      })
      .promise();

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
    // const data = await client
    //   .query({
    //     TableName: tableName,
    //     KeyConditionExpression: '#entity = :entity and #created = :created',
    //     ExpressionAttributeValues: {
    //       ':entity': 'ride',
    //       ':created': event.pathParameters?.id
    //     },
    //     ExpressionAttributeNames: {
    //       '#entity': 'entity',
    //       '#created': 'created'
    //     }
    //   })
    //   .promise();
    const data = await client.get({
      TableName: tableName,
      Key: {
        created: event.pathParameters?.id,
        entity: 'ride'
      }
    });

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
    ride.created = Date.now();
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
      validRide.created = Date.now();
      validRide.entity = 'ride';
      res.push(validRide);
    }
    await client
      .batchWrite({
        RequestItems: {
          [tableName]: res.map((validRide) => ({ PutRequest: { Item: validRide } }))
        }
      })
      .promise();
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

    const body = JSON.parse(event.body);
    const validRideUpdate = await updateRideContract.validateAsync(body, { abortEarly: false });
    // await client
    //   .update({
    //     TableName: tableName,
    //     Key: {
    //       created: event.pathParameters?.id,
    //       entity: 'ride'
    //     },
    //     UpdateExpression: `set ${Object.keys(validRideUpdate)
    //       .map((key) => `#${key} = :${key}`)
    //       .join(', ')}`,
    //     ExpressionAttributeNames: Object.keys(validRideUpdate).reduce(
    //       (res, key) => ({ ...res, [`#${key}`]: key }),
    //       {}
    //     ),
    //     ExpressionAttributeValues: Object.entries(validRideUpdate).reduce(
    //       (res, [key, val]) => ({ ...res, [`:${key}`]: val }),
    //       {}
    //     )
    //   })
    //   .promise();
    await client
      .put({
        TableName: tableName,
        Item: {
          ...validRideUpdate,
          entity: 'ride',
          created: event.pathParameters?.id
        }
      })
      .promise();
    const data = await client
      .get({
        TableName: tableName,
        Key: {
          entity: 'ride',
          created: event.pathParameters?.id
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
    if (!event.queryStringParameters?.ids) {
      throw new ValidationError('No ids in query');
    }
    const ids = event.queryStringParameters.ids.split(',').map((id) => id.trim());
    if (!ids || !ids.length) {
      throw new ValidationError('No ids in query');
    }
    const itemToUpdate = await client
      .batchGet({
        RequestItems: {
          [tableName]: { Keys: ids.map((id) => ({ entity: 'ride', created: id })) }
        }
      })
      .promise();
    if (ids.length > itemToUpdate.Responses[tableName].length) {
      const foundIds = itemToUpdate.Responses[tableName].map((item) => item.created);
      throw new ValidationError(
        `${ids.filter((id) => !foundIds.includes(id)).join(', ')} does not exist`
      );
    }

    const body = JSON.parse(event.body);
    const validRideUpdate = await updateRideContract.validateAsync(body, { abortEarly: false });
    await client
      .batchWrite({
        RequestItems: {
          [tableName]: ids.map((id) => ({
            PutRequest: { Item: { ...validRideUpdate, entity: 'ride', created: id } }
          }))
        }
      })
      .promise();
    const updatedItems = await client
      .batchGet({
        RequestItems: {
          [tableName]: { Keys: ids.map((id) => ({ entity: 'ride', created: id })) }
        }
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: updatedItems.Responses[tableName] })
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
    const data = await client
      .get({
        TableName: tableName,
        Key: {
          entity: 'ride',
          created: event.pathParameters?.id
        }
      })
      .promise();
    await client
      .delete({
        TableName: tableName,
        Key: {
          created: event.pathParameters?.id,
          entity: 'ride'
        }
      })
      .promise();

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
    if (!event.queryStringParameters?.ids) {
      throw new ValidationError('No ids in query');
    }
    const ids = event.queryStringParameters.ids.split(',').map((id) => id.trim());
    if (!ids || !ids.length) {
      throw new ValidationError('No ids in query');
    }
    const itemToDelete = await client
      .batchGet({
        RequestItems: {
          [tableName]: { Keys: ids.map((id) => ({ entity: 'ride', created: id })) }
        }
      })
      .promise();
    if (ids.length > itemToDelete.Responses[tableName].length) {
      const foundIds = itemToDelete.Responses[tableName].map((item) => item.created);
      throw new ValidationError(
        `${ids.filter((id) => !foundIds.includes(id)).join(', ')} does not exist`
      );
    }

    await client
      .batchWrite({
        RequestItems: {
          [tableName]: ids.map((id) => ({
            DeleteRequest: { Key: { entity: 'ride', created: id } }
          }))
        }
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ data: itemToDelete.Responses[tableName] })
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
