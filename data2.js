/* data2.js — kengaytirilgan kontent: qo'shimcha so'zlar, ertak qatorlari, savollar, alifbo, suhbat */
function T0(id) { return TOPICS.find(t => t.id === id); }
const EXTRA_WORDS = {
 g1t1:"pink|pushti|🎀;black|qora|⚫;white|oq|⚪;brown|jigarrang|🟤;gray|kulrang|🐭;rainbow|kamalak|🌈",
 g1t2:"six|olti|6️⃣;seven|yetti|7️⃣;eight|sakkiz|8️⃣;nine|to'qqiz|9️⃣;zero|nol|0️⃣;hundred|yuz|💯",
 g1t3:"lion|sher|🦁;bird|qush|🐦;elephant|fil|🐘;monkey|maymun|🐵;bear|ayiq|🐻;wolf|bo'ri|🐺",
 g1t4:"lemon|limon|🍋;peach|shaftoli|🍑;cherry|olcha|🍒;strawberry|qulupnay|🍓;tomato|pomidor|🍅;carrot|sabzi|🥕",
 g1t5:"baby|chaqaloq|👶;uncle|amaki|🧔;aunt|xola|👩‍🦰;friend|do'st|🤝;family|oila|👪;cousin|amakivachcha|🧒",
 g1t6:"balloon|shar|🎈;drum|nog'ora|🥁;puzzle|jumboq|🧩;blocks|kubiklar|🧱;train|poyezd|🚂;carousel|aylanma o'yin|🎠",
 g2t1:"ear|quloq|👂;hair|soch|💇;tooth|tish|🦷;leg|oyoq (son)|🦵;arm|bilak|💪;finger|barmoq|☝️",
 g2t2:"meat|go'sht|🥩;cheese|pishloq|🧀;cake|tort|🍰;juice|sharbat|🧃;plov|plov|🍛;samsa|somsa|🥟",
 g2t3:"jeans|jinsi|👖;scarf|sharf|🧣;gloves|qo'lqop|🧤;boots|etik|🥾;glasses|ko'zoynak|👓;uniform|maktab formasi|🥼",
 g2t4:"ruler|chizg'ich|📏;eraser|o'chirg'ich|🧽;notebook|daftar|📓;board|doska|🪧;scissors|qaychi|✂️;class|sinf|🏫",
 g2t5:"sofa|divan|🛋️;lamp|chiroq|💡;clock|soat|🕐;key|kalit|🔑;bath|vanna|🛁;TV|televizor|📺",
 g2t6:"bee|asalari|🐝;butterfly|kapalak|🦋;frog|baqa|🐸;turkey|kurka|🦃;tractor|traktor|🚜;snail|shilliqurt|🐌",
 g3t1:"brush teeth|tish tozalamoq|🪥;get dressed|kiyinmoq|👔;have lunch|tushlik qilmoq|🍛;play|o'ynamoq|🎮;watch TV|televizor ko'rmoq|📺;go to bed|yotmoq|🛏️",
 g3t2:"cold|sovuq|🥶;warm|iliq|🌤️;storm|bo'ron|⛈️;fog|tuman|🌫️;umbrella|soyabon|☂️;rainbow|kamalak|🌈",
 g3t3:"ship|kema|🚢;truck|yuk mashinasi|🚚;helicopter|vertolyot|🚁;scooter|samokat|🛴;ambulance|tez yordam|🚑;fire truck|o't o'chirish mashinasi|🚒",
 g3t4:"cook|oshpaz|👨‍🍳;police officer|politsiyachi|👮;firefighter|o't o'chiruvchi|🧑‍🚒;singer|qo'shiqchi|🎤;artist|rassom|🧑‍🎨;scientist|olim|🧑‍🔬",
 g3t5:"school|maktab|🏫;bank|bank|🏦;bakery|novvoyxona|🥖;cinema|kinoteatr|🎬;zoo|hayvonot bog'i|🦒;post office|pochta|📮",
 g3t6:"play football|futbol o'ynamoq|⚽;play chess|shaxmat o'ynamoq|♟️;ride a bike|velosiped minmoq|🚴;jump|sakramoq|🤾;write|yozmoq|✍️;cook food|ovqat pishirmoq|🍳",
 g4t1:"Teachers' Day|Ustozlar kuni|🍎;New Year|Yangi yil|🎄;fireworks|otashbozlik|🎆;card|tabrik kartochkasi|💌;party|ziyofat|🥳;music|musiqa|🎶",
 g4t2:"dentist|tish shifokori|🦷;bandage|bog'lam|🩹;water|suv|💧;wash hands|qo'l yuvish|🧼;rest|dam olish|🛋️;smile|tabassum|😊",
 g4t3:"Friday|juma|📆;Sunday|yakshanba|🌞;today|bugun|📍;tomorrow|ertaga|➡️;yesterday|kecha|⬅️;minute|daqiqa|⏱️",
 g4t4:"sea|dengiz|🌊;sun|quyosh|☀️;star|yulduz|⭐;rain|yomg'ir|🌧️;grass|maysa|🌱;stone|tosh|🪨",
 g4t5:"passport|pasport|🛂;airport|aeroport|🛫;Khiva|Xiva|🏯;museum|muzey|🏛️;photo|surat|📸;guide|yo'lboshchi|🧭",
 g4t6:"keyboard|klaviatura|⌨️;mouse|sichqoncha|🖱️;screen|ekran|🖥️;website|veb-sayt|🕸️;game|o'yin|🎮;battery|batareya|🔋"
};
Object.entries(EXTRA_WORDS).forEach(([id, s]) => T0(id).words.push(...W(s)));

const STORY_EXTRA = {
 1:[["She drinks it slowly.","U sutni sekin ichadi."],["Then she washes her face.","So'ng yuzini yuvadi."],["The little cat says: Thank you, Mom!","Mushuk: Rahmat, ona! deydi."]],
 2:[["Everyone says: Happy Nowruz!","Hamma: Navro'z muborak! deydi."],["Dad brings a big red flower.","Dadam katta qizil gul olib keladi."],["It is the best day of the year.","Bu yilning eng yaxshi kuni."]],
 3:[["He drinks the water and smiles.","U suv ichib jilmayadi."],["A bird shows him the way home.","Qush unga uyga yo'lni ko'rsatadi."],["Mom camel is happy to see him.","Ona tuya uni ko'rib xursand."]],
 4:[["They eat the melon together.","Ular qovunni birga yeydi."],["The seeds go into the garden.","Urug'lar bog'ga ekiladi."],["Next year there are ten melons!","Kelasi yil o'nta qovun bo'ladi!"]],
 5:[["The colors are bright and beautiful.","Ranglar yorqin va chiroyli."],["His friends come to see the picture.","Do'stlari rasmni ko'rgani keladi."],["Everyone says: Great job, Lingo!","Hamma: Barakalla, Lingo! deydi."]],
 6:[["The fox looks for the rabbit.","Tulki quyonni qidiradi."],["But the door is closed.","Lekin eshik yopiq."],["The rabbit eats a carrot and laughs.","Quyon sabzi yeb kuladi."]],
 7:[["Ali plays a slow song.","Ali sekin kuy chaladi."],["The children sing and clap.","Bolalar kuylab, qarsak chaladi."],["Now Ali has many friends.","Endi Alining do'stlari ko'p."]],
 8:[["His neighbor laughs and laughs.","Qo'shnisi kula-kula."],["Afandi laughs too.","Afandi ham kuladi."],["Then they drink tea together.","Keyin ular birga choy ichadi."]],
 9:[["Little stars close their eyes.","Kichik yulduzlar ko'zlarini yumadi."],["The night is quiet.","Tun tinch."],["Everyone sleeps well.","Hamma yaxshi uxlaydi."]],
 10:[["The road is long and wet.","Yo'l uzun va ho'l."],["The driver says: We can do it!","Haydovchi: Uddalaymiz! deydi."],["The children cheer for the bus.","Bolalar avtobusga qarsak chaladi."]],
 11:[["The boy says: Thank you!","Bola: Rahmat! deydi."],["The next day he helps the baker.","Ertasi kuni u novvoyga yordam beradi."],["Now they bake bread together.","Endi ular birga non yopadi."]],
 12:[["She runs to the garden.","U bog'ga yuguradi."],["Her brother holds the string.","Akasi ipni ushlaydi."],["The kite flies again!","Varrak yana uchadi!"]],
 13:[["A boy takes a photo of the dome.","Bola gumbazning suratini oladi."],["The star shines at night.","Yulduz kechasi porlaydi."],["Samarkand is a city of stars.","Samarqand yulduzlar shahri."]],
 14:[["The children bring water.","Bolalar suv olib keladi."],["The tree gives them apples.","Daraxt ularga olma beradi."],["Everyone sits under its shade.","Hamma uning soyasida o'tiradi."]],
 15:[["Grandma tells a story.","Buvi ertak aytadi."],["The children listen quietly.","Bolalar jim tinglaydi."],["Tea, stories and love: that is home.","Choy, ertak va mehr: bu — uy."]],
 16:[["She feeds the fox some bread.","U tulkiga non beradi."],["The fox is not cold now.","Endi tulki sovqotmaydi."],["They become good friends.","Ular yaxshi do'st bo'ladi."]],
 17:[["The children teach him new words.","Bolalar unga yangi so'zlar o'rgatadi."],["He says: apple, book, school!","U: olma, kitob, maktab! deydi."],["Soon he speaks English well.","Tez orada u inglizcha yaxshi gapiradi."]],
 18:[["A bee visits the flower.","Asalari gulga keladi."],["A girl takes a picture of it.","Qiz uning suratini oladi."],["The flower smiles in the wind.","Gul shamolda jilmayadi."]],
 19:[["The wind plays the flute.","Shamol nay chaladi."],["Dad opens the umbrella.","Dadam soyabonni ochadi."],["Then a rainbow comes out.","Keyin kamalak chiqadi."]],
 20:[["The boat meets a friendly fish.","Qayiq do'stona baliqni uchratadi."],["They see a golden island.","Ular oltin orolni ko'radi."],["Lena wakes up and smiles.","Lena uyg'onib jilmayadi."]]
};
// tushunish savollari: [savol en, savol uz, to'g'ri, xato1, xato2]
const STORY_Q = {
 1:["What does the cat see?","Mushuk nimani ko'radi?","milk","fish","a bone"],2:["What does Grandma cook?","Buvi nima pishiradi?","sumalak","plov","soup"],
 3:["What does the camel find?","Tuya nimani topadi?","a river","a tree","a house"],4:["What does the farmer have?","Dehqonda nima bor?","a melon","an apple","a kite"],
 5:["What does Lingo see?","Lingo nimani ko'radi?","a rainbow","a bus","a star"],6:["Who comes to the garden?","Bog'ga kim keladi?","a fox","a dog","a cat"],
 7:["What does Ali have?","Alida nima bor?","a dutar","a drum","a kite"],8:["What does Afandi look for?","Afandi nimani qidiradi?","his donkey","his hat","his book"],
 9:["Who says Good night?","Xayrli tunni kim aytadi?","the stars","the sun","the bus"],10:["Who does the bus drive?","Avtobus kimlarni olib boradi?","children","farmers","doctors"],
 11:["What does the baker make?","Novvoy nima yopadi?","bread","cake","soup"],12:["What color is Dilya's kite?","Dilyaning varragi qanday rang?","red","blue","green"],
 13:["Where is the star?","Yulduz qayerda?","on the dome","in the river","in a bag"],14:["Where does the tree live?","Daraxt qayerda yashaydi?","in the forest","in the desert","in the city"],
 15:["What color is the teapot?","Choynak qanday rang?","blue","red","yellow"],16:["What color is the fox?","Tulki qanday rang?","white","black","green"],
 17:["Where does the robot live?","Robot qayerda yashaydi?","in Tashkent","in Bukhara","in Khiva"],18:["Where does the flower grow?","Gul qayerda o'sadi?","on a mountain","in a house","on a bus"],
 19:["What falls on the window?","Derazaga nima tushadi?","rain","snow","sand"],20:["What is the boat made of?","Qayiq nimadan yasalgan?","paper","wood","metal"]
};
STORIES.forEach(s => { s.lines.push(...(STORY_EXTRA[s.id] || [])); s.q = STORY_Q[s.id]; });
Object.assign(CLUES, {
  lion:['I am the king of animals.','I have a big mane.'], bird:['I can fly.','I sing in the tree.'], elephant:['I am very big.','I have a long trunk.'],
  monkey:['I love bananas.','I climb trees.'], bear:['I am big and brown.','I sleep in winter.'], wolf:['I live in the forest.','I howl at night.'],
  bee:['I make honey.','I say buzz.'], frog:['I jump.','I say ribbit.'], turkey:['I am a big bird.','I say gobble.'], butterfly:['I have colorful wings.','I fly over flowers.']
});
Object.assign(COLORS, { pink:'#f472b6', black:'#1f2937', white:'#ffffff', brown:'#92400e', gray:'#9ca3af' });

const ALPHABET = "A|apple|olma|🍎;B|ball|to'p|⚽;C|cat|mushuk|🐱;D|dog|it|🐶;E|egg|tuxum|🥚;F|fish|baliq|🐟;G|grape|uzum|🍇;H|hat|shapka|🧢;I|ice cream|muzqaymoq|🍦;J|juice|sharbat|🧃;K|kite|varrak|🪁;L|lion|sher|🦁;M|milk|sut|🥛;N|nose|burun|👃;O|orange|apelsin|🍊;P|pear|nok|🍐;Q|queen|malika|👑;R|rabbit|quyon|🐰;S|sun|quyosh|☀️;T|tree|daraxt|🌳;U|umbrella|soyabon|☂️;V|van|furgon|🚐;W|watermelon|tarvuz|🍉;X|box|quti|📦;Y|yellow|sariq|💛;Z|zebra|zebra|🦓"
  .split(';').map(x => { const [l, en, uz, e] = x.split('|'); return { l, en, uz, e }; });
const HARD_SOUNDS = [
  ['th', "Tilingizni tishlar orasiga qo'ying va havo puflang. O'zbek tilida bunday tovush yo'q!", ['think','three','thank','this','mother'], '🦷'],
  ['w / v', "W — lablar yumaloq bo'ladi (tish tegmaydi). V — yuqori tishlar pastki labga tegadi.", ['water','wolf','window','very','van','vase'], '👄'],
  ['r', "Til tanglayga tegmaydi, ingichka tortiladi (o'zbekcha «r» kabi urmang).", ['red','rabbit','river','green','three'], '🐰'],
  ['sh / ch', "SH — cho'ziq shamol; CH — qisqa portlash.", ['ship','shoe','sheep','chair','cheese','church'], '🐑'],
  ['ng', "Til orqasi ko'tariladi, tovush burun orqali chiqadi.", ['sing','king','ring','long','morning'], '🔔'],
  ['h', "Tovushsiz nafas — go'yo ko'zoynakni nafas bilan tozalayotgandek.", ['hat','hand','house','happy','home'], '🧤']
];
// Lingo bilan suhbat (qoidaga asoslangan, AI emas): har burilishda [javob en, uz, Lingo reaksiyasi]
const CHAT = [
 { t:'Tanishuv', e:'👋', turns:[
   { l:'Hello! I am Lingo. What is your name?', u:"Salom! Men Lingoman. Ismingiz nima?", r:[['My name is Ali.',"Mening ismim Ali.",'Nice to meet you, Ali!'],['I am Dilya.',"Men Dilyaman.",'Nice to meet you, Dilya!'],['Hello!',"Salom!",'Hello, my friend!']] },
   { l:'How are you today?', u:"Bugun ahvolingiz qanday?", r:[['I am fine, thank you.',"Yaxshiman, rahmat.",'Great! I am happy too!'],['I am happy.',"Xursandman.",'Wonderful! Let us play!'],['I am tired.',"Charchadim.",'Oh no! Take a rest.']] },
   { l:'How old are you?', u:"Necha yoshdasiz?", r:[['I am seven.',"Men yetti yoshdaman.",'Seven! A great age!'],['I am eight.',"Men sakkiz yoshdaman.",'Eight! Super!'],['I am nine.',"Men to'qqiz yoshdaman.",'Nine! Wow!']] },
   { l:'Goodbye! See you tomorrow!', u:"Xayr! Ertaga ko'rishamiz!", r:[['Goodbye!',"Xayr!",'Bye bye!'],['See you tomorrow!',"Ertagacha!",'See you!']] }
 ]},
 { t:'Maktabda', e:'🏫', turns:[
   { l:'Good morning! Do you like school?', u:"Xayrli tong! Maktabni yaxshi ko'rasizmi?", r:[['Yes, I do.',"Ha, yaxshi ko'raman.",'Super! School is fun!'],['I like my teacher.',"O'qituvchimni yaxshi ko'raman.",'Teachers are great!']] },
   { l:'What is in your bag?', u:"Sumkangizda nima bor?", r:[['A book and a pen.',"Kitob va ruchka.",'Good! You are ready!'],['A pencil and a notebook.',"Qalam va daftar.",'Nice! Study hard!']] },
   { l:'What is your favorite color?', u:"Sevimli rangingiz qaysi?", r:[['Blue.',"Ko'k.",'Blue is like the sky!'],['Red.',"Qizil.",'Red is like an apple!'],['Green.',"Yashil.",'Green is like the grass!']] }
 ]},
 { t:'Oilam', e:'👨‍👩‍👧', turns:[
   { l:'Who is in your family?', u:"Oilangizda kim bor?", r:[['Mother, father and sister.',"Ona, ota va opa.",'What a lovely family!'],['I have a grandmother.',"Buvim bor.",'Grandmas are the best!']] },
   { l:'What do you eat at home?', u:"Uyda nima yeysiz?", r:[['I eat plov.',"Men plov yeyman.",'Yum! Plov is tasty!'],['I eat bread and soup.',"Non va sho'rva.",'Delicious!']] },
   { l:'Do you love your family?', u:"Oilangizni yaxshi ko'rasizmi?", r:[['Yes, I love my family.',"Ha, oilamni sevaman.",'Aww! Love is the best!']] }
 ]}
];
const ACCESSORIES = [['glasses','Ko‘zoynak','🕶️',10],['bow','Bant','🎀',8],['headphones','Quloqchin','🎧',20],['scarf','Sharf','🧣',15],['crown','Toj','👑',30]];
const SOUND_PAIRS = ['ship / sheep','think / sink','very / berry','wet / vet','chair / share','sing / sin'];

/* O'zbekcha imlo: oʻ/gʻ -> o‘ g‘ ; tutuq belgisi -> ’ (yagona standart) */
function uzFix(s) { return typeof s !== 'string' ? s : s.replace(/([oOgG])['ʼʻ’`‘]/g, '$1‘').replace(/([A-Za-z])['ʼ`]/g, '$1’'); }
TOPICS.forEach(t => { t.culture = uzFix(t.culture); t.uz = uzFix(t.uz); t.s.uz = uzFix(t.s.uz); t.words.forEach(w => w.uz = uzFix(w.uz)); });
STORIES.forEach(s => { s.uz = uzFix(s.uz); s.lines.forEach(l => l[1] = uzFix(l[1])); if (s.q) s.q[1] = uzFix(s.q[1]); });
[...SONGS, ...POEMS].forEach(s => { s.uz = uzFix(s.uz); s.lines.forEach(l => l[1] = uzFix(l[1])); });
RIDDLES.forEach(r => r.uz = uzFix(r.uz));
ALPHABET.forEach(a => a.uz = uzFix(a.uz));
HARD_SOUNDS.forEach(h => h[1] = uzFix(h[1]));
CHAT.forEach(c => c.turns.forEach(t => { t.u = uzFix(t.u); t.r.forEach(r => r[1] = uzFix(r[1])); }));
