const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.QUOTES_TABLE;
const { verifyToken } = require('../lib/auth');

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const res = (c, b) => ({ statusCode: c, headers: hdrs, body: JSON.stringify(b) });
const una = () => ({ statusCode: 401, headers: hdrs, body: 'unauthorized' });

exports.handler = async (event) => {
    try { verifyToken((event.headers.Authorization || '').split(' ')[1]); }
    catch { return una(); }

    const id = event.pathParameters.id;
    const { status } = JSON.parse(event.body || '{}');
    const okStatus = ['new', 'contacted', 'quoted', 'closed'];
    if (!okStatus.includes(status)) return res(400, { error: 'invalid status' });

    await dynamo.update({
        TableName: TABLE,
        Key: { id },
        UpdateExpression: 'set #s=:s, updatedAt=:u',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': status, ':u': new Date().toISOString() }
    }).promise();

    return res(200, { id, status });
};
