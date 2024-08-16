require('dotenv/config');
const { Client } = require('discord.js');
const { OpenAI } = require('openai');
const fs = require('fs');

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
        console.log('Error parson JSON string: ', err)
    }
 });

client.on('ready', () => {
    console.log('Hanaday in the building!');
})

const IGNORE_PREFIX = "!";
const CHANNELS = [1272667552752992328];
const openai = new OpenAI ({
    apiKey: process.env.OPENAI_KEY
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    //if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    // await message.channel.sendTyping();

    // const sendTypingInterval = setInterval(() => {
    //     message.channel.sendTyping();
    // }, 5000)

    let conversation = [];
    conversation.push({
        role: 'system',
        content: 'Chat GPT is a friendly chatbot'
    })

    let prevMessages = await message.channel.messages.fetch({limit: 10});
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if (msg.author.id === client.user.id) {
            conversation.push({
                role: 'assistant',
                name: username,
                content: msg.content
            });
            return;
        }
        
        conversation.push({
            role: 'user',
            name: username,
            content: msg.content
        })
    })

    // const response = await openai.chat.completions.create({
    //         model: 'gpt-3.5-turbo',
    //         messages: conversation
    //     }).catch((error) => console.error('OpenAI Error:\n', error));

    // clearInterval(sendTypingInterval);

    // if (!response) {
    //     message.reply("Having a brain fart. Pls try again later");
    //     return;
    // }

    // const responseMessage = response.choices[0].message.content;

    // const chunkSizeLimit = 2000;

    // for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
    //     const chunk = responseMessage.substring(i, i + chunkSizeLimit);
    //     await message.reply(chunk);
    // }
    // message.author.send('Big test');
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction);
    if (interaction.commandName === 'aye') {
        interaction.reply('aye domino');
    };
    if (interaction.commandName === 'native') {
        const min = interaction.options.get('low-limit')?.value || 1;
        const max = interaction.options.get('upper-limit')?.value || 100;
        let stop = false;
        // Generate a random number between the range

        //loop
        // while (!stop) {
    
            let quiz = Math.floor(Math.random() * (max - min + 1)) + min;
            console.log(`random value is ${quiz}`);
            
            console.log(`low value is ${min} and high value is ${max}`);
            // Query the JSON for the solution

            let answer = native[quiz];
            console.log (`correct answer is ${answer}`);

            await interaction.reply(`${quiz}?`);
            let correct = false;
            const collector = interaction.channel.createMessageCollector({
                filter: (message) => message.content === answer,
                time: 30_000
            });

            collector.on('collect', (message) => {
                if (message.content.toLowerCase() === 'stop') {
                    stop = true;
                }
                    message.reply('Correct :D');
                    correct = true;
                
                collector.stop();
            });

            collector.on('end', () => {
                if (!correct) {
                    interaction.channel.send(
                        `Time ran out. The answer was **${answer}**`
                    )
                }
            }); 
        }
        //   
    

})

client.login(process.env.TOKEN)