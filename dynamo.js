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
const isInUsersTable = async (userid) => {
    const users = await getUsers();
    console.log (`isInUserTable? ${users.Items.some(user => user.userid === userid)}`);
    return users.Items.some(user => user.userid === userid);
}
const addOrUpdateUser = async (user) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Item: user
    }
    try {
        return await dynamoClient.put(params).promise();
    } catch (error) {
        console.error('Error putting user into database:', error);
    }
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
const setActiveDayNumberById = async (userid, username, newValue) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        },
        UpdateExpression: "set activeDayNumber = :r",
        ExpressionAttributeValues: {
            ":r": newValue
        },
        ReturnValues: "UPDATED_NEW"
    };

    return await dynamoClient.update(params).promise();
}
const setTotalDayNumberById = async (userid, username, newValue) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        },
        UpdateExpression: "set activeTotalNumber = :r",
        ExpressionAttributeValues: {
            ":r": newValue
        },
        ReturnValues: "UPDATED_NEW"
    };

    return await dynamoClient.update(params).promise();
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

const hasActiveSetBool = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        }
    }
    const result = await dynamoClient.get(params).promise();
    console.log(result.Item.activeSet);
    return result.Item.activeSet;
}
const setActiveSetToTrue = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        },
        UpdateExpression: "set activeSet = :r",
        ExpressionAttributeValues: {
            ":r": true
        },
        ReturnValues: "UPDATED_NEW"
    };

    return await dynamoClient.update(params).promise();
}
const setActiveSetToFalse = async (userid, username) => {
    const params = {
        TableName: USERS_TABLE_NAME,
        Key: {
            userid,
            username
        },
        UpdateExpression: "set activeSet = :r",
        ExpressionAttributeValues: {
            ":r": false
        },
        ReturnValues: "UPDATED_NEW"
    };

    return await dynamoClient.update(params).promise();
}
const isLastDay = async (userid, username) => {
    const activeDay = await getActiveDayNumberById(userid, username);
    const totalDays = await getTotalDayNumberById(userid, username);
    return activeDay === totalDays;
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
const getActiveSets = async () => {
    const params = {
        TableName: ACTIVE_TABLE_NAME
    };
    const activeSets = await dynamoClient.scan(params).promise();
    console.log(activeSets);
    return activeSets;
}
const isInActiveSetTable = async (userid) => {
    const activeSets = await getActiveSets();
    console.log(`isInActiveSetTable? ${activeSets.Items.some(user => user.userid === userid)}`);
    return activeSets.Items.some(user => user.userid === userid);
}
const deleteActiveSet = async (userid) => {
    const params = {
        TableName: ACTIVE_TABLE_NAME,
        Key: {
            userid
        }
    }
    return await dynamoClient.delete(params).promise();
}
const addOrUpdateActiveSet = async (set) => {
    const params = {
        TableName: ACTIVE_TABLE_NAME,
        Item: set,
    }
    return await dynamoClient.put(params).promise();
}

// helper

const createNewUser = async (userid, username, activeSet, activeDayNumber, totalDayNumber, timeToSend, spacedRepetition, topic) => {
    const jsonObject = {
        userid: userid,
        username: username,
        activeSet: activeSet,
        activeDayNumber: activeDayNumber,
        totalDayNumber: totalDayNumber.content,
        timeToSend: timeToSend,
        spacedRepetition: spacedRepetition,
        topic: topic
    };
    await addOrUpdateUser(jsonObject);
    return "Successfully added to Users Table"
}

const createNewActiveSet = async (userid, username, words) => {
    const jsonObject = {
        userid: userid,
        username: username,
        words: words
    };
    if (!(await isInActiveSetTable(userid))) {
        await addOrUpdateActiveSet(jsonObject);
        return "Successfully added to Active Set Table";
    } else {
        return "User already exists in this table";
    }
}

const getNextVocabWordToSend = async (userid, username) => {
    const index = await getActiveDayNumberById(userid, username);
    const activeSet = await getActiveSetById(userid, username);
    const nextWord = activeSet[index];
    console.log(nextWord);
    return nextWord;
}

const incrementActiveDayNumberById = async (userid, username) => {
    const currentADNum = await getActiveDayNumberById(userid, username);
    const nextNum = currentADNum + 1;
    await setActiveDayNumberById(userid, username, nextNum);
    console.log(`ActiveDayNumber changed from ${currentADNum} to ${nextNum}`);
}

const jb = {
    'userid': "007",
    'username': "justinbieber",
    'totalDays': 3
}
const words = 
    {
        "1": {
            "korean_word": "화성학",
            "english_definition": "harmony theory",
            "part_of_speech": "noun",
            "explanation": "Refers to the study of harmony in music, including the construction and progression of chords. This term is often used in formal music education and analysis."
        },
        "2": {
            "korean_word": "음악적 해석",
            "english_definition": "musical interpretation",
            "part_of_speech": "noun",
            "explanation": "Describes the unique way in which a musician or conductor brings their personal expression to a piece of music. This term is commonly used in discussions about performance styles and artistic choices."
        },
        "3": {
            "korean_word": "음향학",
            "english_definition": "acoustics",
            "part_of_speech": "noun",
            "explanation": "The branch of physics concerned with the properties of sound. In music, it often refers to how sound behaves in different environments, like concert halls. Used in both scientific and musical contexts."
        }
    }

    //deleteActiveSet
    
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
    addOrUpdateActiveSet,
    isInUsersTable,
    hasActiveSetBool,
    isInActiveSetTable,
    deleteActiveSet,
    setActiveSetToTrue,
    setActiveSetToFalse,
    isLastDay,
    createNewUser,
    createNewActiveSet,
    getNextVocabWordToSend,
    incrementActiveDayNumberById,
    setActiveDayNumberById,
    setTotalDayNumberById
}