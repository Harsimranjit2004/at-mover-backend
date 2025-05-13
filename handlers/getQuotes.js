const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.QUOTES_TABLE;
const { verifyToken } = require('../lib/auth');

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const ok = b => ({ statusCode: 200, headers: hdrs, body: JSON.stringify(b) });
const una = () => ({ statusCode: 401, headers: hdrs, body: 'unauthorized' });

exports.handler = async (event) => {
  try { verifyToken((event.headers.Authorization || '').split(' ')[1]); }
  catch { return una(); }

  const res = await dynamo.scan({ TableName: TABLE }).promise();
  const items = res.Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return ok({ items });
};
