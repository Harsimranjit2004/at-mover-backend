const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.QUOTES_TABLE;

const hdrs = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
const res = (c, b) => ({ statusCode: c, headers: hdrs, body: JSON.stringify(b) });

exports.handler = async (event) => {
    try {
        const data = JSON.parse(event.body || '{}');
        const req = ['name', 'email', 'phone', 'moveDate', 'moveFrom', 'moveTo', 'propertySize'];
        for (const f of req) { if (!data[f]) return res(400, { error: `Missing ${f}` }); }

        const item = { id: uuid(), ...data, status: 'new', timestamp: new Date().toISOString() };
        await dynamo.put({ TableName: TABLE, Item: item }).promise();
        return res(201, { id: item.id });
    } catch (e) { console.error(e); return res(500, { error: 'internal' }); }
};
