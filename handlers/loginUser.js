const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.USERS_TABLE;
const { comparePassword, signToken } = require('../lib/auth');

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const res = (c, b) => ({ statusCode: c, headers: hdrs, body: JSON.stringify(b) });

exports.handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body || '{}');
        if (!username || !password) return res(400, { error: 'missing creds' });

        const { Item } = await dynamo.get({ TableName: TABLE, Key: { username } }).promise();
        if (!Item || !comparePassword(password, Item.passwordHash)) return res(401, { error: 'invalid' });

        return res(200, { token: signToken({ username }) });
    } catch (e) { console.error(e); return res(500, { error: 'internal' }); }
};
