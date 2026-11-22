/* LingoUz Kids — kontent: 24 mavzu, 20 ertak, 6 qo'shiq, 6 sheʼr, 12 topishmoq */
const W = s => s.split(';').map(x => { const [en, uz, e] = x.split('|'); return { en, uz, e }; });

// [sinf, id, ikona, uzNom, enNom, madaniy izoh, so'zlar, jumla[en, uz, to'g'ri so'z, xato1, xato2]]
const RAW_TOPICS = [
  [1,'g1t1','🌈','Ranglar','Colors',"O'zbekiston bayrog'ida ko'k, oq va yashil ranglar bor. Atlas matolari esa juda rang-barang!",
   "red|qizil|🔴;blue|ko'k|🔵;green|yashil|🟢;yellow|sariq|🟡;orange|to'q sariq|🟠;purple|binafsha|🟣",
   ["The sky is blue.","Osmon ko'k.","blue","red","green"]],
  [1,'g1t2','🔢','Sonlar','Numbers',"Bozorda non, olma yoki anorni sanashda ingliz sonlarini ishlating: one, two, three!",
   "one|bir|1️⃣;two|ikki|2️⃣;three|uch|3️⃣;four|to'rt|4️⃣;five|besh|5️⃣;ten|o'n|🔟",
   ["I have two hands.","Mening ikkita qo'lim bor.","two","five","ten"]],
  [1,'g1t3','🐪','Hayvonlar','Animals',"Tuya – cho'l kemasi! Qo'y va sigir esa har bir qishloq hovlisida bor.",
   "cat|mushuk|🐱;dog|it|🐶;cow|sigir|🐄;horse|ot|🐴;sheep|qo'y|🐑;camel|tuya|🐪",
   ["The cow gives milk.","Sigir sut beradi.","cow","cat","horse"]],
  [1,'g1t4','🍉','Mevalar','Fruits',"Samarqand qovuni, Xorazm tarvuzi va Farg'ona uzumi butun dunyoda mashhur.",
   "apple|olma|🍎;pear|nok|🍐;grape|uzum|🍇;melon|qovun|🍈;watermelon|tarvuz|🍉;banana|banan|🍌",
   ["The melon is sweet.","Qovun shirin.","melon","apple","pear"]],
  [1,'g1t5','👨‍👩‍👧','Oila','Family',"O'zbek oilasida buvi va bobo juda hurmatli. Hamma dasturxon atrofida yig'iladi.",
   "mother|ona|👩;father|ota|👨;sister|opa-singil|👧;brother|aka-uka|👦;grandmother|buvi|👵;grandfather|bobo|👴",
   ["I love my mother.","Men onamni yaxshi ko'raman.","mother","father","sister"]],
  [1,'g1t6','🪁','O‘yinchoqlar','Toys',"Bahorda Navro'z kunlari bolalar varrak uchirishni yaxshi ko'radi.",
   "ball|to'p|⚽;doll|qo'g'irchoq|🪆;kite|varrak|🪁;car|mashina|🚗;teddy bear|ayiqcha|🧸;robot|robot|🤖",
   ["I play with a ball.","Men to'p bilan o'ynayman.","ball","doll","kite"]],

  [2,'g2t1','🧍','Tana a’zolari','Body',"Salomlashganda o'zbeklar o'ng qo'lni ko'kragiga qo'yadi – bu hurmat belgisi.",
   "head|bosh|🙂;eye|ko'z|👁️;nose|burun|👃;mouth|og'iz|👄;hand|qo'l|✋;foot|oyoq|🦶",
   ["I smell with my nose.","Men burnim bilan hidlayman.","nose","eye","hand"]],
  [2,'g2t2','🍲','Taomlar','Food',"Plov, somsa, non va ko'k choy – o'zbek dasturxonining asosiy mehmonlari!",
   "bread|non|🍞;rice|guruch|🍚;soup|sho'rva|🍲;milk|sut|🥛;tea|choy|🍵;egg|tuxum|🥚",
   ["We drink green tea.","Biz ko'k choy ichamiz.","tea","milk","soup"]],
  [2,'g2t3','🧥','Kiyimlar','Clothes',"O'g'il bolalar do'ppi, qizlar esa atlas ko'ylak kiyishni yaxshi ko'radi.",
   "hat|shapka|🧢;shirt|ko'ylak|👕;dress|libos|👗;shoes|poyabzal|👟;socks|paypoq|🧦;coat|palto|🧥",
   ["I wear a hat.","Men shapka kiyaman.","hat","shirt","coat"]],
  [2,'g2t4','🎒','Maktab','School',"1-sentabrda butun O'zbekiston bolalari yangi sumka bilan maktabga boradi.",
   "book|kitob|📖;pen|ruchka|🖊️;pencil|qalam|✏️;bag|sumka|🎒;desk|parta|🪑;teacher|o'qituvchi|👩‍🏫",
   ["My pen is on the desk.","Ruchkam partada.","desk","bag","book"]],
  [2,'g2t5','🏡','Uy','Home',"O'zbek hovlisida ayvon, tandir va bog' bo'ladi. Mehmonlar doim kutib olinadi.",
   "house|uy|🏠;kitchen|oshxona|🍳;bed|karavot|🛏️;door|eshik|🚪;window|deraza|🪟;garden|bog'|🌳",
   ["The garden is big.","Bog' katta.","garden","door","kitchen"]],
  [2,'g2t6','🐰','Qishloq hovlisi','Farm',"Qishloqdagi buvimning hovlisida tovuq, o'rdak va quyonlar yashaydi.",
   "chicken|tovuq|🐔;duck|o'rdak|🦆;goat|echki|🐐;donkey|eshak|🫏;rabbit|quyon|🐰;fish|baliq|🐟",
   ["The rabbit eats a carrot.","Quyon sabzi yeydi.","rabbit","duck","goat"]],

  [3,'g3t1','⏰','Kun tartibi','Daily Routine',"Ertalab nonushta, so'ng maktab, kechqurun oila bilan dasturxon – bu har kuni takrorlanadi.",
   "wake up|uyg'onmoq|⏰;wash|yuvinmoq|🧼;eat breakfast|nonushta qilmoq|🥣;go to school|maktabga bormoq|🏫;do homework|uy vazifasini qilmoq|📝;sleep|uxlamoq|😴",
   ["I wake up at seven.","Men soat yettida uyg'onaman.","seven","nine","ten"]],
  [3,'g3t2','⛅','Ob-havo','Weather',"Toshkentda yoz issiq, qish esa sovuq. Tog'larda esa qor ko'p yog'adi.",
   "sunny|quyoshli|☀️;rainy|yomg'irli|🌧️;cloudy|bulutli|☁️;snowy|qorli|❄️;windy|shamolli|💨;hot|issiq|🥵",
   ["It is sunny today.","Bugun havo quyoshli.","sunny","rainy","snowy"]],
  [3,'g3t3','🚇','Transport','Transport',"Toshkent metrosi dunyodagi eng chiroyli metrolardan biri – bekatlar saroydek!",
   "bus|avtobus|🚌;train|poyezd|🚆;plane|samolyot|✈️;bike|velosiped|🚲;metro|metro|🚇;taxi|taksi|🚕",
   ["I go to school by bus.","Men maktabga avtobusda boraman.","bus","train","bike"]],
  [3,'g3t4','👩‍⚕️','Kasblar','Jobs',"Novvoy tandirda issiq non yopadi, dehqon esa paxta va mevalarni yetishtiradi.",
   "doctor|shifokor|👩‍⚕️;teacher|o'qituvchi|👩‍🏫;farmer|dehqon|👨‍🌾;pilot|uchuvchi|🧑‍✈️;baker|novvoy|🥖;builder|quruvchi|👷",
   ["The baker makes bread.","Novvoy non yopadi.","baker","farmer","doctor"]],
  [3,'g3t5','🏙️','Shahar joylari','Town',"Har shaharda katta bozor bor. Chorsu bozori esa Toshkentning eng mashhur joyi.",
   "market|bozor|🛒;park|bog'|🌳;hospital|kasalxona|🏥;library|kutubxona|📚;shop|do'kon|🏪;stadium|stadion|🏟️",
   ["We go to the market.","Biz bozorga boramiz.","market","park","library"]],
  [3,'g3t6','⚽','Mashg‘ulotlar','Hobbies',"Bolalar kurash, futbol va shaxmatni yaxshi ko'radi. Raqs – bayramlarning ziynati!",
   "swim|suzmoq|🏊;draw|chizmoq|🎨;sing|kuylamoq|🎤;dance|raqsga tushmoq|💃;read|o'qimoq|📚;run|yugurmoq|🏃",
   ["I like to dance.","Men raqsga tushishni yaxshi ko'raman.","dance","swim","draw"]],

  [4,'g4t1','🌷','Navro‘z va bayramlar','Holidays',"Navro'z – 21-mart. Sumalak pishiriladi, qo'shiqlar aytiladi, bolalarga sovg'alar beriladi.",
   "Nowruz|Navro'z|🌷;gift|sovg'a|🎁;sumalak|sumalak|🥣;flag|bayroq|🇺🇿;holiday|bayram|🎉;festival|festival|🎪",
   ["Nowruz is a spring holiday.","Navro'z – bahor bayrami.","spring","winter","summer"]],
  [4,'g4t2','💪','Salomatlik','Health',"Buvilarimiz «Sog'lik – boylik» deyishadi. Meva va sabzavot yeng, ko'proq harakat qiling!",
   "healthy|sog'lom|💪;medicine|dori|💊;fever|isitma|🤒;vitamin|vitamin|🍊;sleep|uyqu|🛌;exercise|mashq|🤸",
   ["Fruit is good for health.","Meva salomatlik uchun foydali.","Fruit","Candy","Soda"]],
  [4,'g4t3','📅','Vaqt va kunlar','Time',"Maktabda dushanbadan jumagacha o'qiymiz. Shanba va yakshanba – dam olish kunlari.",
   "Monday|dushanba|📅;morning|ertalab|🌅;evening|kechqurun|🌆;week|hafta|🗓️;month|oy|🌙;year|yil|🎆",
   ["Today is Monday.","Bugun dushanba.","Monday","Friday","Sunday"]],
  [4,'g4t4','🏔️','Tabiat','Nature',"Chimyon tog'lari, Orol dengizi va Qizilqum – O'zbekiston tabiati juda xilma-xil.",
   "river|daryo|🏞️;mountain|tog'|⛰️;forest|o'rmon|🌲;flower|gul|🌸;tree|daraxt|🌳;desert|sahro|🏜️",
   ["The mountain is high.","Tog' baland.","mountain","river","desert"]],
  [4,'g4t5','🕌','Sayohat','Travel',"Samarqand, Buxoro va Xiva – Buyuk Ipak yo'lining durdonalari. Turistlar ularni ko'rgani keladi.",
   "Samarkand|Samarqand|🕌;Bukhara|Buxoro|🏰;map|xarita|🗺️;ticket|chipta|🎫;hotel|mehmonxona|🏨;suitcase|chamadon|🧳",
   ["We travel to Samarkand.","Biz Samarqandga sayohat qilamiz.","Samarkand","Bukhara","Tashkent"]],
  [4,'g4t6','💻','Texnologiya','Technology',"O'zbekiston yoshlari dasturlash va robototexnika bilan qiziqadi. Kelajak sizniki!",
   "computer|kompyuter|💻;phone|telefon|📱;robot|robot|🤖;internet|internet|🌐;camera|kamera|📷;tablet|planshet|📲",
   ["I use a computer.","Men kompyuterdan foydalanaman.","computer","phone","camera"]]
];

const TOPICS = RAW_TOPICS.map(r => ({
  grade: r[0], id: r[1], icon: r[2], uz: r[3], en: r[4], culture: r[5],
  words: W(r[6]), s: { en: r[7][0], uz: r[7][1], ans: r[7][2], wrong: [r[7][3], r[7][4]] }
}));

const COLORS = { red:'#ef4444', blue:'#3b82f6', green:'#22c55e', yellow:'#facc15', orange:'#fb923c', purple:'#a855f7' };
const CLUES = {
  cat:['I say meow.','I like milk and fish.'], dog:['I say woof.','I guard the house.'],
  cow:['I give milk.','I say moo.'], horse:['I run very fast.','People ride me.'],
  sheep:['I give wool.','I say baa.'], camel:['I live in the desert.','I have a hump.'],
  chicken:['I lay eggs.','I say cluck.'], duck:['I say quack.','I can swim.'],
  goat:['I have little horns.','I climb the hills.'], donkey:['I say hee-haw.','I carry heavy bags.'],
  rabbit:['I have long ears.','I love carrots.'], fish:['I live in water.','I have no legs.']
};

// ---- ERTAKLAR (20) : [id, emoji, en nom, uz nom, sinf, [[en, uz] x3]]
const STORIES = [
 [1,'🐱','The Hungry Cat','Och mushuk',1,[["A little cat is hungry.","Kichkina mushuk och edi."],["She sees a bowl of milk.","U bir kosa sutni ko'rdi."],["Yum! Now the cat is happy.","Mazali! Endi mushuk xursand."]]],
 [2,'🥣','The Magic Sumalak','Sehrli sumalak',4,[["It is Nowruz. Grandma cooks sumalak.","Navro'z. Buvim sumalak pishiryapti."],["All the children sing a song at night.","Kechasi hamma bolalar qo'shiq aytadi."],["In the morning, the sumalak is sweet and warm.","Ertalab sumalak shirin va issiq bo'ladi."]]],
 [3,'🐪','The Little Camel','Tuyacha',1,[["A little camel walks in the desert.","Tuyacha cho'lda yuradi."],["He is thirsty and tired.","U chanqagan va charchagan."],["He finds a river. Hooray!","U daryoni topdi. Yashasin!"]]],
 [4,'🍈','The Golden Melon','Oltin qovun',2,[["A farmer has a big golden melon.","Dehqonning katta oltin qovuni bor."],["He shares it with his friends.","U uni do'stlari bilan bo'lishadi."],["Sharing makes everyone happy.","Bo'lishish hammani xursand qiladi."]]],
 [5,'🌈','Lingo and the Rainbow','Lingo va kamalak',1,[["Lingo sees a rainbow after the rain.","Lingo yomg'irdan keyin kamalakni ko'radi."],["Red, yellow, green and blue!","Qizil, sariq, yashil va ko'k!"],["Lingo paints the rainbow in his book.","Lingo kamalakni daftariga chizadi."]]],
 [6,'🐰','The Clever Rabbit','Aqlli quyon',2,[["A rabbit is in the garden.","Quyon bog'da turibdi."],["A fox comes. The rabbit runs home.","Tulki keladi. Quyon uyiga yuguradi."],["Clever rabbits are always safe.","Aqlli quyonlar doim xavfsiz."]]],
 [7,'🎶','The Magic Dutar','Sehrli dutor',3,[["Ali has an old dutar.","Alining eski dutori bor."],["When he plays, the birds sing with him.","U chalganda qushlar u bilan birga kuylaydi."],["Music makes friends everywhere.","Musiqa hamma joyda do'st orttiradi."]]],
 [8,'🫏','Afandi and the Donkey','Afandi va eshak',3,[["Afandi looks for his donkey.","Afandi eshagini qidiryapti."],["He sits on the donkey and still looks for it!","U eshakka minib turib ham uni qidiradi!"],["We laugh and say: look carefully!","Biz kulamiz: yaxshilab qara!"]]],
 [9,'🌙','The Sleepy Moon','Uyqusirovchi oy',1,[["The moon is very sleepy.","Oy juda uyqusiragan."],["The stars say: Good night!","Yulduzlar: Xayrli tun! deydi."],["The sun wakes up and says: Good morning!","Quyosh uyg'onib: Xayrli tong! deydi."]]],
 [10,'🚌','The Brave Little Bus','Jasur avtobuscha',3,[["A little bus drives children to school.","Kichik avtobus bolalarni maktabga olib boradi."],["It is rainy and windy today.","Bugun yomg'irli va shamolli."],["The bus is brave. All children arrive on time.","Avtobus jasur. Bolalar o'z vaqtida yetib boradi."]]],
 [11,'🥖','The Kind Baker','Mehribon novvoy',3,[["The baker makes bread every morning.","Novvoy har ertalab non yopadi."],["He gives warm bread to a hungry boy.","U och bolaga issiq non beradi."],["Kindness is the best gift.","Mehribonlik – eng yaxshi sovg'a."]]],
 [12,'🪁','The Lost Kite','Yo‘qolgan varrak',2,[["Dilya has a red kite.","Dilyaning qizil varragi bor."],["The wind takes it high in the sky.","Shamol uni osmonga olib chiqib ketadi."],["A bird brings it back. Thank you, bird!","Qush uni qaytarib keladi. Rahmat, qush!"]]],
 [13,'⭐','The Samarkand Star','Samarqand yulduzi',4,[["A star sits on the blue dome in Samarkand.","Samarqanddagi ko'k gumbazda yulduz o'tiradi."],["Travellers look up and smile.","Sayyohlar tepaga qarab jilmayadi."],["The star says: this city is beautiful.","Yulduz: bu shahar go'zal, deydi."]]],
 [14,'🌳','The Talking Tree','Gapiradigan daraxt',4,[["An old tree lives in the forest.","Eski daraxt o'rmonda yashaydi."],["It talks to the children about nature.","U bolalar bilan tabiat haqida gaplashadi."],["We must love and protect trees.","Biz daraxtlarni sevishimiz va asrashimiz kerak."]]],
 [15,'🍵','Grandma’s Blue Teapot','Buvimning ko‘k choynagi',2,[["Grandma has a blue teapot.","Buvimning ko'k choynagi bor."],["Every evening, the family drinks tea.","Har kech oila choy ichadi."],["The teapot keeps our family warm.","Choynak oilamizni issiq saqlaydi."]]],
 [16,'🦊','The Snow Fox','Qor tulkisi',3,[["It is snowy in the mountains.","Tog'larda qor yog'yapti."],["A white fox is cold and alone.","Oq tulki sovuq qotgan va yolg'iz."],["A kind girl gives her a warm coat.","Mehribon qiz unga issiq palto beradi."]]],
 [17,'🤖','The Little Robot','Kichkina robot',4,[["A little robot lives in Tashkent.","Kichkina robot Toshkentda yashaydi."],["He wants to learn English.","U ingliz tilini o'rganmoqchi."],["Every day he says: Hello, friend!","U har kuni: Salom, do'st! deydi."]]],
 [18,'🌸','The Mountain Flower','Tog‘ guli',4,[["A small flower grows on a high mountain.","Baland tog'da kichik gul o'sadi."],["Rain and sun help it grow.","Yomg'ir va quyosh unga o'sishga yordam beradi."],["Small things can be very beautiful.","Kichik narsalar ham juda go'zal bo'lishi mumkin."]]],
 [19,'🌧️','The Rain Orchestra','Yomg‘ir orkestri',2,[["Drip, drop! Rain falls on the window.","Tip-tap! Yomg'ir derazaga tushadi."],["The tree, the roof and the river play music.","Daraxt, tom va daryo musiqa chaladi."],["Kids dance in the rain.","Bolalar yomg'irda raqsga tushadi."]]],
 [20,'⛵','The Dream Boat','Orzu qayig‘i',4,[["Lena has a small boat made of paper.","Lenaning qog'ozdan yasalgan kichik qayig'i bor."],["It sails to a country of dreams.","U orzular mamlakatiga suzib boradi."],["Dream big and learn every day!","Katta orzu qiling va har kuni o'rganing!"]]]
].map(a => ({ id:a[0], e:a[1], en:a[2], uz:a[3], grade:a[4], lines:a[5] }));

// ---- QO'SHIQLAR va SHE'RLAR (original matnlar)
const SONGS = [
 ['🎵','Hello Song','Salom qo‘shig‘i',[["Hello, hello, how are you?","Salom, salom, ahvollaring qanday?"],["I am fine, and you too!","Yaxshiman, sen ham yaxshisan!"],["Clap your hands, one, two, three,","Qarsak chal: bir, ikki, uch,"],["Hello, friends, come play with me!","Salom, do'stlar, men bilan o'ynang!"]]],
 ['🌈','Rainbow Colors','Kamalak ranglari',[["Red and yellow, green and blue,","Qizil, sariq, yashil, ko'k,"],["Rainbow colors shine for you!","Kamalak ranglari sen uchun yarqiraydi!"],["Orange, purple in the sky,","Zarg'aldoq va binafsha osmonda,"],["Wave your hand and say goodbye!","Qo'l silkib xayrlash!"]]],
 ['🔢','Count to Five','Beshgacha sanaymiz',[["One, two, three, four, five,","Bir, ikki, uch, to'rt, besh,"],["Count the stars, count the bees!","Yulduzlarni sana, asalarilarni sana!"],["Five little fingers on my hand,","Qo'limda beshta barmoq,"],["Count with me, my friend, again!","Men bilan yana sana, do'stim!"]]],
 ['🐮','Animal Sounds','Hayvon ovozlari',[["The cat says meow, the dog says woof,","Mushuk miyov, it vov deydi,"],["The cow says moo under the roof,","Sigir ma'raydi tom ostida,"],["The sheep says baa, the duck says quack,","Qo'y mee, o'rdak kvak deydi,"],["Come on, animals, sing it back!","Qani, hayvonlar, qaytaring!"]]],
 ['🌷','Nowruz Is Here','Navro‘z keldi',[["Spring is here, Nowruz is here,","Bahor keldi, Navro'z keldi,"],["Flowers smile and skies are clear,","Gullar kulib, osmon ochiq,"],["Sumalak is warm and sweet,","Sumalak issiq va shirin,"],["Dance and sing with happy feet!","Xursand oyoqlarda raqsga tush!"]]],
 ['☀️','Good Morning','Xayrli tong',[["Good morning, sun, good morning, day,","Xayrli tong, quyosh, xayrli kun,"],["Wake up now and come to play,","Endi uyg'on va o'ynashga kel,"],["Wash your face and brush your teeth,","Yuzingni yuv, tishingni tozala,"],["School is waiting, off we go!","Maktab kutyapti, ketdik!"]]]
].map((a,i)=>({ id:'s'+i, kind:'song', e:a[0], en:a[1], uz:a[2], lines:a[3] }));

const POEMS = [
 ['👨‍👩‍👧','My Family','Mening oilam',[["Mother is kind, Father is strong,","Ona mehribon, ota kuchli,"],["Grandma tells me a story long,","Buvim menga uzun ertak aytadi,"],["Sister and brother play with me,","Opa-uka men bilan o'ynaydi,"],["I love my happy family!","Men xursand oilamni sevaman!"]]],
 ['☀️','The Sun','Quyosh',[["The sun is yellow, the sun is bright,","Quyosh sariq, quyosh yorqin,"],["It gives the world its warm light,","U dunyoga iliq nur beradi,"],["Flowers grow and children play,","Gullar o'sadi, bolalar o'ynaydi,"],["Thank you, sun, for a lovely day!","Rahmat, quyosh, go'zal kun uchun!"]]],
 ['🍎','The Apple Tree','Olma daraxti',[["Little tree in my garden green,","Yam-yashil bog'imdagi kichik daraxt,"],["Red apples are the best I've seen,","Qizil olmalar men ko'rgan eng yaxshisi,"],["Sun and rain help you to grow,","Quyosh va yomg'ir o'sishingga yordam beradi,"],["Sweet apples for me, you know!","Menga shirin olma, bilasanmi!"]]],
 ['🎒','My School Bag','Mening sumkam',[["Book and pencil, pen and ruler,","Kitob, qalam, ruchka va chizg'ich,"],["My school bag is a happy keeper,","Sumkam ularni asrovchi do'st,"],["In the morning, off I go,","Ertalab yo'lga chiqaman,"],["Learning English makes me glow!","Ingliz tili meni nurlantiradi!"]]],
 ['🤝','A Friend','Do‘st',[["A friend is kind, a friend is true,","Do'st mehribon, do'st sodiq,"],["A friend will share and play with you,","Do'st bo'lishadi va o'ynaydi,"],["Say hello with a smile,","Tabassum bilan salom ayt,"],["Friends are great, all the while!","Do'stlar har doim ajoyib!"]]],
 ['🌸','Spring','Bahor',[["Spring is warm and spring is green,","Bahor iliq va yam-yashil,"],["Birds and flowers can be seen,","Qushlar va gullar ko'rinadi,"],["Rain is falling, grass is new,","Yomg'ir yog'adi, maysa yangi,"],["Spring, we are so glad to see you!","Bahor, seni ko'rganimizdan xursandmiz!"]]]
].map((a,i)=>({ id:'p'+i, kind:'poem', e:a[0], en:a[1], uz:a[2], lines:a[3] }));

// ---- TOPISHMOQLAR
const RIDDLES = [
 ["I am yellow and I shine in the sky.","Men sariqman va osmonda yarqirayman.",["sun","moon","star"],"sun","☀️"],
 ["I have two wheels. You ride me.","Mening ikkita g'ildiragim bor. Meni minasiz.",["bike","bus","car"],"bike","🚲"],
 ["I say meow and I love milk.","Men miyov deyman va sutni yaxshi ko'raman.",["dog","cat","cow"],"cat","🐱"],
 ["I am red. You eat me. I grow on a tree.","Men qizilman. Meni yeysiz. Daraxtda o'saman.",["apple","book","bread"],"apple","🍎"],
 ["You read me. I have many pages.","Meni o'qiysiz. Mening ko'p sahifam bor.",["bag","book","desk"],"book","📖"],
 ["I fall from clouds and make things wet.","Men bulutdan tushaman va hamma narsani ho'l qilaman.",["rain","wind","snow"],"rain","🌧️"],
 ["I live in the desert. I have a hump.","Men cho'lda yashayman. Mening o'rkachim bor.",["camel","horse","sheep"],"camel","🐪"],
 ["You drink me. I am white. A cow gives me.","Meni ichasiz. Men oqman. Sigir meni beradi.",["tea","milk","soup"],"milk","🥛"],
 ["I have a face but no eyes. I show the time.","Mening yuzim bor, ko'zim yo'q. Men vaqtni ko'rsataman.",["clock","bed","door"],"clock","⏰"],
 ["I fly high and I have a long tail. Children love me.","Men baland uchaman, dumim uzun. Bolalar meni yaxshi ko'radi.",["kite","plane","bird"],"kite","🪁"],
 ["I help you write. I need a sharpener.","Men yozishga yordam beraman. Menga o'tkirlagich kerak.",["pen","pencil","book"],"pencil","✏️"],
 ["I am the king of animals. I have a big mane.","Men hayvonlar shohiman. Mening katta yolim bor.",["lion","cat","rabbit"],"lion","🦁"]
].map(a => ({ q:a[0], uz:a[1], opts:a[2], ans:a[3], e:a[4] }));
