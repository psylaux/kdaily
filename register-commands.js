require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'aye',
        description: 'replies with domino',
    },
    {
        name: 'native',
        description: 'quiz on native numbers 1-100',
        options: [
            {
                name: 'low-limit',
                description: 'Enter lower limit',
                type: ApplicationCommandOptionType.Number
            },
            {
                name: 'upper-limit',
                description: 'Enter upper limit',
                type: ApplicationCommandOptionType.Number
            }
        ]
    },
    {
        name: 'sino',
        description: 'quiz on sino numbers'
    },
    {
        name: 'hanaday',
        description: 'start word of the day'
    }   
    // {
    //     name: 'aye',
    //     description: 'replies with domino',
    // },
    // {
    //     name: 'native',
    //     description: 'quiz on native numbers 1-100'
    // },
    // {
    //     name: 'sino',
    //     description: 'quiz on sino numbers'
    // },
    // {
    //     name: 'hanaday',
    //     description: 'start word of the day'
    // }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async() => {
    try {
        console.log ('registering slash commands');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )
        console.log ('slash done');
    } catch (error) {
        console.log(`oops: ${error}`)
    }

})();