require('dotenv/config');
const { Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const { OpenAI } = require('openai');
const fs = require('fs');
const cron = require('node-cron');
const db = require('./dynamo');

let native, sino = {};
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
})
fs.readFile('api/native.json', 'utf8', (err, str) => {
   if (err) {
       console.log('Error reading file from disk', err)
       return;
   }
   try {
       const data = JSON.parse(str);
       native = data;
   } catch (err) {
       console.log('Error parsing JSON string: ', err)
   }
});
fs.readFile('api/sino.json', 'utf8', (err, str) => {
   if (err) {
       console.log('Error reading file from disk', err)
       return;
   }
   try {
       const info = JSON.parse(str);
       sino = info;
   } catch (err) {
       console.log('Error parson JSON string: ', err)
   }
});
function capitalizeFirstLetter(str) {
    if (typeof str !== 'string') {
        str = str.toString();
    }
    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
}

client.on('ready', () => {
    console.log('Hanaday in the building!');
})

const CHANNELS = [1272667552752992328];
const openai = new OpenAI ({
    apiKey: process.env.OPENAI_KEY
});

const generateSinoValue = (num) => {
    const sinoKorean = {
        0: "공",
        1: "일",
        2: "이",
        3: "삼",
        4: "사",
        5: "오",
        6: "육",
        7: "칠",
        8: "팔",
        9: "구"
    };

    const units = ["", "십", "백", "천"];
    const largeUnits = ["", "만", "억"];
    
    let numStr = num.toString();
    let length = numStr.length;
    let result = "";
    
    let chunkCount = Math.ceil(length / 4);

    for (let i = 0; i < chunkCount; i++) {
        let chunk = numStr.slice(-4 * (i + 1), length - 4 * i);
        let chunkLength = chunk.length;
        let chunkResult = "";

        for (let j = 0; j < chunkLength; j++) {
            let digit = chunk[j];
            let sinoDigit = sinoKorean[digit];
            
            if (digit !== "0") {
                chunkResult += sinoDigit + units[chunkLength - 1 - j];
            }
        }

        if (chunkResult) {
            result = chunkResult + largeUnits[i] + result;
        }
    }

    return result || sinoKorean[0];
}
const setCompleted = async (userid, username) => {
    await db.deleteActiveSet(userid);
    await db.setActiveSetToFalse(userid, username);
    await db.setActiveDayNumberById(userid, username, 0);
    await db.setTotalDayNumberById(userid, username, 0);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'aye') {
        interaction.reply('aye domino');
    };
    /**TODO: Add randomize balancer
     * https://stackoverflow.com/questions/196017/unique-non-repeating-random-numbers-in-o1
    */
    if (interaction.commandName === 'native') {
        const min = interaction.options.get('low-limit')?.value || 1;
        const max = interaction.options.get('upper-limit')?.value || 100;
        let total = 0;
        let numCorrect = 0;
        let stop = false;
        await interaction.reply("Starting native korean numbers game! Reply 'stop' to quit, reply 'help' when you don't know.");
        while (!stop) {
            total++;
            let quiz = Math.floor(Math.random() * (max - min + 1)) + min;
            let answer = native[quiz];
            console.log (`correct answer is ${answer}`);

            await interaction.channel.send(`${quiz}?`);
            let correct = false;

            let filter = message => !message.author.bot;
            let msgs = await interaction.channel.awaitMessages({filter, max: 1, time: 180_000});
            let response = msgs.first();

            if (response.content.toLowerCase() === 'stop') {
                total--;
                await interaction.channel.send(`Ending game. You got ${numCorrect}/${total} correct, 잘 했다!`);
                stop = true;
            } else if (response.content === 'help') {
                await interaction.channel.send(`The answer is ${answer}. Reply with ${answer}:`);
                let filter2 = msg => msg.content === answer;
                let msgs2 = await interaction.channel.awaitMessages({filter2, max: 1, time: 180_000});
                if (msgs2.first().content === answer) {
                    msgs2.first().reply('Great job! Keep going:)');
                    correct = true;
                } else {
                    response.reply(`Nope. The answer is ${answer}`);
                }
            }
            else if (response.content === answer) {
                response.reply('Correct :D');
                correct = true;
                numCorrect++;
            } else {
                response.reply(`Nope. The answer is ${answer}`);
            }

            if (false) { // add timer checking
                interaction.channel.send(
                    `Time ran out. The answer was **${answer}**`
                )
            }
        }
    };
    if (interaction.commandName === "sino") {
        let numCorrect = 0;
        let total = 0;
        let stop = false;

        const firstButton = new ButtonBuilder()
        .setLabel('1-10')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('set-1');

        const secondButton = new ButtonBuilder()
        .setLabel('10-100')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('set-2');

        const thirdButton = new ButtonBuilder()
        .setLabel('100-1000')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('set-3');

        const fourthButton = new ButtonBuilder()
        .setLabel('1000-10000')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('set-4');

        const fifthButton = new ButtonBuilder()
        .setLabel('10000+')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('set-5');

        const buttonRow = new ActionRowBuilder().addComponents(firstButton, secondButton, thirdButton, fourthButton, fifthButton);

        const reply = await interaction.reply({content: 'Starting sino korean numbers game! Choose a range ⤵️. ', components: [buttonRow]});

        let filter = () => true;
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button, filter
        });

        let min, max;
        collector.on('collect', async (interaction) => {
            await interaction.reply("Lets go! Reply 'stop' to quit, and reply 'help' when you don't know the answer.");
            switch (interaction.customId) {
                case 'set-1': {
                    min = 1;
                    max = 10;
                    break;
                }
                case 'set-2': {
                    min = 10;
                    max = 100;
                    break;
                }
                case 'set-3': {
                    min = 100;
                    max = 1_000;
                    break;
                }
                case 'set-4': {
                    min = 1_000;
                    max = 10_000;
                    break;
                }
                case 'set-5': {
                    min = 10_000
                    max = 1_000_000
                    break;
                }
            }

            while (!stop) {
                total++;
                let quiz = Math.floor(Math.random() * (max - min + 1)) + min;
                await interaction.channel.send(`${quiz}?`);
                console.log (`digit answer is ${quiz}`);

                let answer = generateSinoValue(quiz);
                console.log (`correct answer is ${answer}`);
    
                let msgs = await interaction.channel.awaitMessages({filter, max: 1, time: 180_000});
                let response = msgs.first();

                if (response.content.toLowerCase() === 'stop') {
                    total--;
                    await interaction.channel.send(`Ending game. You got ${numCorrect}/${total} correct, 잘 했다!`);
                    stop = true;
                } else if (response.content === 'help') {
                    await interaction.channel.send(`The answer is ${answer}. Reply with ${answer}:`);
                    let filter2 = msg => msg.content === answer;
                    let msgs2 = await interaction.channel.awaitMessages({filter2, max: 1, time: 180_000});
                    if (msgs2.first().content === answer) {
                        msgs2.first().reply('Great job! Keep going:)');
                        correct = true;
                    } else {
                        response.reply(`Nope. The answer is ${answer}`);
                    }
                }
                else if (response.content === answer) {
                    response.reply('Correct :D');
                    correct = true;
                    numCorrect++;
                } else {
                    response.reply(`Nope. The answer is ${answer}`);
                }
            }
        });
    };
    if (interaction.commandName === "hanaday") {
        const userid = interaction.member.user.id;
        const username = interaction.member.user.username;
        let topic, activeDays, totalDays, level, newUser;

        if (await db.isInUsersTable(userid)) {
            if (await db.hasActiveSetBool(userid, username)) {
                interaction.reply("You already have an active set.");
                return;
            } else {
                newUser = false;
            }
        } else newUser = true;

        console.log ("new user is", newUser, userid, username);

        await interaction.reply("Yo. What kind of words you wanna learn?\nYou can say things like movies, gaming, space, technology, cooking, animals, etc. You can also say random.");
        let filter = message => !message.author.bot;
        let msgs = await interaction.channel.awaitMessages({filter, max: 1, time: 180_000});
        let response = msgs.first();
        topic = response;

        await interaction.channel.send(`${capitalizeFirstLetter(response)} is so amazing. How many days do you wanna learn this for?`);
        msgs = await interaction.channel.awaitMessages({filter, max: 1, time: 180_000});
        response = msgs.first();
        totalDays = response.content;

        const firstButton = new ButtonBuilder()
        .setLabel('Beginner')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('beg');

        const secondButton = new ButtonBuilder()
        .setLabel('Intermediate')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('int');

        const thirdButton = new ButtonBuilder()
        .setLabel('Advanced')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('adv');

        const buttonRow = new ActionRowBuilder().addComponents(firstButton, secondButton, thirdButton);
        const reply = await interaction.channel.send({content: 'Spice level? ', components: [buttonRow]});

        filter = () => true;
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button, filter
        });

        collector.on('collect', async (interaction) => {
            await interaction.reply("Cookin' up a storm, piece of cake (cake cake cake)...");
            switch (interaction.customId) {
                case "beg": level = 'beginner';
                case "int": level = 'intermediate';
                case "adv": level = 'difficult';
            }
        })
        
        let conversation = [];
        let gptrequest = {
            role: 'system',
            content: `Please provide a json object of ${totalDays} ${level} korean vocabulary words related to this topic: ${topic}. The object should have the word number as the key and an object of the korean word, english definition, part of speech, and an explanation of its use case as the value. (keys: "korean_word", "english_definition", "part_of_speech", "explanation)`
        }
    
        conversation.push(gptrequest);
            
        // await interaction.channel.sendTyping();

        const sendTypingInterval = setInterval(async () => {
            await interaction.channel.sendTyping();
        }, 5000)
        const gptresponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: conversation
        }).catch((error) => console.error('OpenAI Error:\n', error));

        if (!gptresponse) {
            interaction.channel.send("Having a brain fart. Pls try again later");
            return;
        }

        const responseJSON = JSON.parse(gptresponse.choices[0].message.content);

        console.log(responseJSON);

        let formattedResponse = "";
        for (let key in responseJSON) {
            console.log (`key is ${key}`);
            console.log(`word is ${responseJSON[key].korean_word}`);
            console.log (`definition is ${responseJSON[key].english_definition}`)
            if (responseJSON.hasOwnProperty(key)) {
                formattedResponse += `${responseJSON[key].korean_word}: ${responseJSON[key].english_definition}\n`;
            }
        }
        clearInterval(sendTypingInterval);

        await interaction.channel.send(formattedResponse);
        await interaction.channel.send("Great. Let's get started tomorrow.");
        
        // Set up database
        console.log("Hey iTS ME", userid, username);
        
        if (newUser) {
            await db.createNewUser(userid, username, true, 0, totalDays, "14:30", false, null);
        } else {
            await db.setActiveSetToTrue(userid, username);
            await db.setTotalDayNumberById(userid, username, totalDays);
        }
        
        await db.createNewActiveSet(userid, username, responseJSON);

        interaction.member.user.send(`Hey ${username}, I'll be back later with a daily word for you.`);
     
        const job = cron.schedule('30 15 * * *', async () => {
            await db.incrementActiveDayNumberById(userid, username);
            const nextWord = await db.getNextVocabWordToSend(userid, username);
            interaction.member.user.send(nextWord.korean_word, nextWord.definition);
            if (await db.isLastDay(userid, username)) {
                setCompleted();
                job.stop();
            }
        });
    }
})

client.login(process.env.TOKEN)