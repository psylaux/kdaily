// Create a JSON on vocab
const readline = require('readline');
const vocab = {
    '만족': {
        definition: 'satisfaction',
        definition_full: '[명사] satisfaction, contentment, (formal) gratification, [동사] be satisfied (with), be pleased (with), be content[contented] (with), (formal) be gratified',
        particle: 'noun 명사',
        sentence_1: { 
            kr: '그녀는 혼자 사는 것에 만족하고 있다',
            en: "She is content to live by herself."
        },
        sentence_2: {
            kr: '지금 하고 있는 일에 만족하세요?',
            en: 'Are you satisfied[pleased; content] with your present work?'
        },
        sentence_3: {
            kr: '성적 만족을 얻다',
            en: 'get sexual satisfaction[gratification]'
        }
    },
    '도망': {
       definition: 'to run away',
       definition_full: '	[명사] escape, flight, [동사] escape, flee, bolt, run[get] away (from), take (to) flight, make a getaway, (formal) fly; (연인과 함께) elope',
       particle: 'verb 동사',
       sentence_1: {
        kr: '그는 지난달에 정신병원에서 도망쳤다',
        en: 'He escaped from a mental hospital last month.'
       },
       sentence_2: {
        kr: '죄수가 가시철조망을 넘어 도망쳤다',
        en: 'The convict escaped over the barbed wires.'
       },
       sentence_3: {
        kr: `A: 길거리를 지나가는데 집채만 한 개가 날 막 쫓아오는 거야.
        B: 그래서 어떻게 했어?
        A: 걸음아 날 살려라 하고 도망쳤지.`,
        en: `A: A huge dog started chasing me when I was walking down the street.
        B: So what did you do?
        A: I ran like hell.`
       }
    },
    '겁쟁이': {
        definition: 'coward' ,
        definition_full: 'coward, (informal) chicken',
        particle: 'noun 명사',
        sentence_1: {
            kr: `겁쟁이. - 제가 겁쟁이여서요`,
            en: `Coward - I'm a coward.`
        },
        sentence_2: {
            kr: `이 겁쟁이! 뭐가 무서운 거야?`,
            en: `You coward! What are you afraid of?`
        },
        sentence_3: {
            kr: `누군가에게 뭔가 할말이 있다면, 그냥 직접 말해. 겁쟁이처럼 굴지 말고.`,
            en: `If you have something to say to someone, just tell them directly instead of being a coward about it. `,
        }
    },
    // '무질서': 'chaos',
    // '폭력': 'violence',
    // '뒤집다': 'to turn upside down',
    // '공포': 'fear',
    // '의무': 'obligation',
    // '징그럽다': 'to be gross, disgusting',
    // '한심하다' : 'pathetic, pitiful'
}
// Create functions for each type of task

function promptDailyWord() {
    const keys = Object.keys(vocab);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    console.log(randomKey, 'is random key')

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const out = (value) => {
        console.log(value, '\n');
    }
    out(`"__라는 단어를 아세요?" means "Do you know the word __ ?"`);
    out(`'${randomKey}'(이)라는 단어를 아세요?`)

    rl.question('yes or no: ', (answer) => {
        if (answer === 'yes') {
            out('great! 😊')
        }
        else {
            out(`${randomKey} is your word of the day`);
            out(`${randomKey} is a ${vocab[randomKey].particle} that means ${vocab[randomKey].definition}`);
        };
        rl.close();
    });
    return;
}



promptDailyWord();