const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE_NAME = "Users";
const ACTIVE_TABLE_NAME = "ActiveVocabSet";
const SAVED_TABLE_NAME = "SavedVocabSet";

const getUsers = async () => {
    const params = {
        TableName: USERS_TABLE_NAME
    };
    const users = await dynamoClient.scan(params).promise();
    console.log(users);
    return users;
}

const addOrUpdateUser = async (user) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Item: user
    }
    return await dynamoClient.put(params).promise();
} 

const getUserById = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    return await dynamoClient.get(params).promise();
}

const deleteUser = async (userid) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid
        }
    }
    return await dynamoClient.delete(params).promise();
} 

const getActiveDayNumberById = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    const result = await dynamoClient.get(params).promise();
    return result.Item ? result.Item.activeDayNumber : null;
}

const getTotalDayNumberById = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    const result = await dynamoClient.get(params).promise();
    console.log(result.Item.totalDayNumberDayNumber);
    return result.Item ? result.Item.totalDayNumber : null;
}


const getTimeToSendById = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    
    const result = await dynamoClient.get(params).promise();
    return result.Item ? result.Item.timeToSend : null;
}

// Active Vocab Set

const getActiveSetById = async (userid, username) => {
    const params = {
        TableName: ACTIVE_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    const result = await dynamoClient.get(params).promise();
    return result.Item ? result.Item.words : null;
}

const addOrUpdateActiveSet = async (set) => {
    const params = {
        TableName: ACTIVE_TABLE_NAME,
        Item: set,
    }
    return await dynamoClient.put(params).promise();
}

module.exports = {
    dynamoClient,
    getUsers,
    getUserById,
    addOrUpdateUser,
    deleteUser,
    getActiveDayNumberById,
    getTotalDayNumberById,
    getTimeToSendById,
    getActiveSetById,
    addOrUpdateActiveSet
}