const { DocumentClient } = require('aws-sdk/clients/dynamodb');

const { logger, ValidationError, ServerError } = require('./utils');
const { createRideContract, updateRideContract } = require('./validation');

const client = new DocumentClient({ region: 'us-east-1', apiVersion: '2012-08-10' });
const tableName = 'ride-service5-customerTestTable4';
const secretToken = 'very-very-secret-token';

/**
 * query
 * - this method has access to dynamodb functionality to work with indexes, like primary index (partition key and sort key), GSI (partition key or sort key or both), LSI (partition key (from primary index) or sort key or both).
 * - this method accept next fields:
 * - - KeyConditionExpression - filters by the index attribute (if IndexName does not specified, then filtering happens by Primary index, which is unique for each record)
 * - - ExpressionAttributeValues - object with key-value pair, which will replace a piece of expression in KeyConditionExpression and FilterExpression, which is responsible for value filter (key name starts with colon (:))
 * - - IndexName (optional) - 
 * - - FilterExpression (optional) - almost the same as KeyConditionExpression, but for non index attribute
 * - - ExpressionAttributeNames (optional) - object with key-value pair, which will replace a piece of expression in KeyConditionExpression and FilterExpression, which is responsible for name of attribute (key name starts with grid (#))
 * - - ProjectionExpression (optional) - you may define a set of attributes you want to get from query execution
 * - Indexes
 * - - Primary Index - each table has it and it is unique for each record
 * - - - It is a Partition Key or combination of Partition Key and Sort Key
 * - - - It is better to use a combination, since DynamoDB good work with one table pattern
 * - - Global Secondary Index (GSI) - perform a copy of a whole DB, under the hood, but with different Partition Key and Sort Key, that's why use it smart without overhead.
 * - - - Might be a Partition Key or combination of Partition Key and Sort Key
 * - - - May not be unique for each record
 * - - - Can create on an existing table
 * - - - Up to 20 per table
 * - - Local Secondary Index (LSI) - change Sort Key for Partition Key in Primary Index, which perform increases of finding record in Partition Key
 * - - - Can not create on an existing table
 * - - - Up to 5 per table
 * - example of params:
 * - - {
        IndexName: 'EmailIndex',
        TableName: "tblUsers",
        ExpressionAttributeNames: {
          "#password": "password",
          "#email": "email"
        },
        ExpressionAttributeValues: {
          ":emailValue": "email",
          ":passwordValue": "password",
        },
        FilterExpression: "#password = :passwordValue",
        KeyConditionExpression: "#email = :emailValue",
        ProjectionExpression: "password, email"
      }
 * - additional info:
 * - - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html
 * - - https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html
 * scan
 * - it goes through every record in table and check the condition, 'query' method is similar a little bit, but work in more optimized way with indexes
 */

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
 * put - done
 *  create - done
 *  update - done
 *  delete - done
 */

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
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
    //       ':created': Number(event.pathParameters?.id)
    //     },
    //     ExpressionAttributeNames: {
    //       '#entity': 'entity',
    //       '#created': 'created'
    //     }
    //   })
    //   .promise();
    const data = await client
      .get({
        TableName: tableName,
        Key: {
          created: Number(event.pathParameters?.id),
          entity: 'ride'
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: data.Item })
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
      headers: {
        'Content-Type': 'application/json'
      },
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
    const hrTime = process.hrtime();
    ride.created = hrTime[0] * 1000000000 + hrTime[1];
    ride.entity = 'ride';
    await client
      .put({
        TableName: tableName,
        Item: ride
      })
      .promise();
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      const hrTime = process.hrtime();
      const validRide = await createRideContract.validateAsync(ride, { abortEarly: false });
      validRide.created = hrTime[0] * 1000000000 + hrTime[1];
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
    //       created: Number(event.pathParameters?.id),
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
    const { Item: entityToUpdate } = await client
      .get({
        TableName: tableName,
        Key: {
          entity: 'ride',
          created: Number(event.pathParameters?.id)
        }
      })
      .promise();
    await client
      .put({
        TableName: tableName,
        Item: {
          ...entityToUpdate,
          ...validRideUpdate,
          entity: 'ride',
          created: entityToUpdate.created
        }
      })
      .promise();
    const data = await client
      .get({
        TableName: tableName,
        Key: {
          entity: 'ride',
          created: entityToUpdate.created
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: data.Item })
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
      headers: {
        'Content-Type': 'application/json'
      },
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
    const ids = event.queryStringParameters.ids.split(',').map((id) => Number(id.trim()));
    if (!ids || !ids.length) {
      throw new ValidationError('No ids in query');
    }
    const itemsToUpdate = await client
      .batchGet({
        RequestItems: {
          [tableName]: { Keys: ids.map((id) => ({ entity: 'ride', created: id })) }
        }
      })
      .promise();
    if (ids.length > itemsToUpdate.Responses[tableName].length) {
      const foundIds = itemsToUpdate.Responses[tableName].map((item) => item.created);
      throw new ValidationError(
        `${ids.filter((id) => !foundIds.includes(id)).join(', ')} does not exist`
      );
    }

    const body = JSON.parse(event.body);
    const validRideUpdate = await updateRideContract.validateAsync(body, { abortEarly: false });
    await client
      .batchWrite({
        RequestItems: {
          [tableName]: itemsToUpdate.Responses[tableName].map((item) => ({
            PutRequest: {
              Item: { ...item, ...validRideUpdate, entity: 'ride', created: item.created }
            }
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
          created: Number(event.pathParameters?.id)
        }
      })
      .promise();
    await client
      .delete({
        TableName: tableName,
        Key: {
          created: Number(event.pathParameters?.id),
          entity: 'ride'
        }
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: data.Item })
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
      headers: {
        'Content-Type': 'application/json'
      },
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
    const ids = event.queryStringParameters.ids.split(',').map((id) => Number(id.trim()));
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
