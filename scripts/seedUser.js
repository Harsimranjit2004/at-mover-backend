const AWS = require('aws-sdk');
const { hashPassword } = require('../lib/auth');
const { v4: uuid } = require('uuid');

async function main() {
    const [, , username = 'admin', password = 'ChangeMe!23', profile = 'personal'] = process.argv;
    const USERS_TABLE = process.env.USERS_TABLE;
    if (!USERS_TABLE) throw new Error('Set USERS_TABLE env var');

    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile });
    const dynamo = new AWS.DynamoDB.DocumentClient();

    await dynamo.put({
        TableName: USERS_TABLE,
        Item: {
            username,
            passwordHash: hashPassword(password),
            id: uuid(),
            createdAt: new Date().toISOString()
        },
        ConditionExpression: 'attribute_not_exists(username)'
    }).promise();

    console.log(`Seeded "${username}" in ${USERS_TABLE} (${profile})`);
}

main().catch(err => (console.error(err), process.exit(1)));
