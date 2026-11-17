// QuickCheck "try it" test bank — 3 grade bands x 8 subjects x 10 items.
// DRAFT: written by Claude, every item to be checked by Arvin before it goes live.
//
// Each set:  title  – the name shown to the teacher (SHS uses the real SHS core subject)
//            comps  – the competencies used by the ready-made TOS
//            items  – { q: question, c: [A, B, C, D], key: correct letter,
//                       comp: index into comps, p: share of the made-up class that gets it right }
// "p" only drives the made-up class in the animation and item analysis; it is not a claim about real learners.

const TEST_SETS = {

// ======================================================================
// ELEMENTARY (Grades 4–6; Grades 1–3 use these too for now)
// ======================================================================
ELEM: {
 Math: {title:"Math", comps:["Whole numbers","Fractions and decimals","Geometry and measurement","Patterns and data"], items:[
  {q:"345 + 278 = ?", c:["613","523","513","623"], key:"D", comp:0, p:.85},
  {q:"8 × 7 = ?", c:["56","54","63","48"], key:"A", comp:0, p:.88},
  {q:"Which fraction is equal to 1/2?", c:["2/3","1/4","3/6","2/5"], key:"C", comp:1, p:.70},
  {q:"0.5 + 0.25 = ?", c:["0.30","0.55","0.75","7.5"], key:"C", comp:1, p:.62},
  {q:"How many sides does a hexagon have?", c:["6","7","5","8"], key:"A", comp:2, p:.80},
  {q:"A square has 6 cm sides. What is its perimeter?", c:["12 cm","36 cm","18 cm","24 cm"], key:"D", comp:2, p:.55},
  {q:"What comes next? 3, 6, 9, 12, ___", c:["14","15","16","18"], key:"B", comp:3, p:.90},
  {q:"Round 4,768 to the nearest hundred.", c:["4,700","4,800","4,770","5,000"], key:"B", comp:0, p:.58},
  {q:"How many minutes are in 2 hours?", c:["120","100","60","200"], key:"A", comp:2, p:.83},
  {q:"A class has 40 learners. 25 are girls. How many are boys?", c:["25","15","65","10"], key:"B", comp:3, p:.82}]},

 Science: {title:"Science", comps:["Living things","Matter","Earth and space","Energy and force"], items:[
  {q:"Which part of a plant makes food?", c:["roots","leaves","stem","flower"], key:"B", comp:0, p:.78},
  {q:"Which animal is a mammal?", c:["frog","tilapia","chicken","carabao"], key:"D", comp:0, p:.80},
  {q:"Ice melting into water is a change from:", c:["solid to liquid","liquid to gas","gas to liquid","liquid to solid"], key:"A", comp:1, p:.72},
  {q:"Which object is attracted to a magnet?", c:["wooden stick","plastic spoon","glass marble","iron nail"], key:"D", comp:3, p:.85},
  {q:"The Sun rises in the:", c:["east","north","south","west"], key:"A", comp:2, p:.88},
  {q:"What is the main source of energy on Earth?", c:["the Moon","the wind","the Sun","batteries"], key:"C", comp:3, p:.84},
  {q:"Animals that eat only plants are called:", c:["carnivores","herbivores","omnivores","decomposers"], key:"B", comp:0, p:.68},
  {q:"Which of these dissolves in water?", c:["sugar","sand","pebbles","cooking oil"], key:"A", comp:1, p:.74},
  {q:"When a strong typhoon comes, what should you do?", c:["swim at the beach","fly a kite","stay indoors","climb a tree"], key:"C", comp:2, p:.92},
  {q:"Which planet is called the Red Planet?", c:["Venus","Jupiter","Mars","Saturn"], key:"C", comp:2, p:.60}]},

 English: {title:"English", comps:["Grammar","Vocabulary","Reading comprehension"], items:[
  {q:"Which word is a verb?", c:["happy","run","table","blue"], key:"B", comp:0, p:.82},
  {q:"\"I ate ___ apple.\"", c:["an","a","two","many"], key:"A", comp:0, p:.70},
  {q:"The opposite of \"tall\" is:", c:["wide","big","long","short"], key:"D", comp:1, p:.90},
  {q:"\"The dog ___ barking loudly.\"", c:["are","were","is","be"], key:"C", comp:0, p:.74},
  {q:"Which word rhymes with \"cat\"?", c:["cut","cap","cot","hat"], key:"D", comp:1, p:.86},
  {q:"Which sentence asks a question?", c:["What is your name?","Close the door.","I like mangoes.","We are happy."], key:"A", comp:0, p:.88},
  {q:"\"Ana watered the plants every morning. Soon, they grew tall.\" Why did the plants grow tall?", c:["Ana sang to them.","It was dark.","Ana watered them every morning.","They were new."], key:"C", comp:2, p:.80},
  {q:"The plural of \"box\" is:", c:["boxs","boxes","box","boxies"], key:"B", comp:0, p:.66},
  {q:"Which word means \"very big\"?", c:["tiny","quick","soft","huge"], key:"D", comp:1, p:.76},
  {q:"\"Ben forgot his umbrella. When the rain came, he got wet.\" What happened first?", c:["Ben got wet.","Ben forgot his umbrella.","The rain came.","Ben went home."], key:"B", comp:2, p:.58}]},

 Filipino: {title:"Filipino", comps:["Gramatika","Talasalitaan","Pag-unawa sa binasa"], items:[
  {q:"Alin ang pangngalan?", c:["tumakbo","paaralan","maganda","mabilis"], key:"B", comp:0, p:.80},
  {q:"Alin ang pandiwa?", c:["malaki","kumain","bahay","siya"], key:"B", comp:0, p:.78},
  {q:"Ano ang kasalungat ng \"mataas\"?", c:["malaki","malawak","mahaba","mababa"], key:"D", comp:1, p:.90},
  {q:"Ano ang kasingkahulugan ng \"masaya\"?", c:["malungkot","galit","maligaya","pagod"], key:"C", comp:1, p:.82},
  {q:"Alin ang panghalip panao?", c:["aklat","maganda","siya","takbo"], key:"C", comp:0, p:.76},
  {q:"Ilang pantig mayroon ang salitang \"paaralan\"?", c:["tatlo","lima","dalawa","apat"], key:"D", comp:1, p:.60},
  {q:"\"Maagang gumising si Lito upang tumulong sa kanyang ina.\" Anong ugali ang ipinakita ni Lito?", c:["matulungin","tamad","mayabang","malungkot"], key:"A", comp:2, p:.88},
  {q:"Anong bantas ang inilalagay sa dulo ng tanong?", c:["tandang pananong (?)","kuwit (,)","tuldok (.)","tandang padamdam (!)"], key:"A", comp:0, p:.85},
  {q:"\"Nagluto si Nanay ng adobo.\" Sino ang gumawa ng kilos?", c:["adobo","nagluto","ng","Nanay"], key:"D", comp:2, p:.79},
  {q:"Ano ang salitang-ugat ng \"kumain\"?", c:["kain","kumain","um","kainan"], key:"A", comp:1, p:.55}]},

 AP: {title:"Araling Panlipunan", comps:["Heograpiya ng Pilipinas","Kasaysayan","Pamahalaan at mamamayan"], items:[
  {q:"Ilang pangunahing pangkat ng pulo mayroon ang Pilipinas?", c:["dalawa","tatlo","apat","lima"], key:"B", comp:0, p:.88},
  {q:"Ano ang kabisera ng Pilipinas?", c:["Cebu","Davao","Baguio","Maynila"], key:"D", comp:0, p:.90},
  {q:"Sino ang sumulat ng \"Noli Me Tangere\"?", c:["Jose Rizal","Andres Bonifacio","Emilio Aguinaldo","Apolinario Mabini"], key:"A", comp:1, p:.86},
  {q:"Anong karagatan ang nasa silangan ng Pilipinas?", c:["Karagatang Artiko","Karagatang Indian","Karagatang Atlantiko","Karagatang Pasipiko"], key:"D", comp:0, p:.62},
  {q:"Saang kontinente matatagpuan ang Pilipinas?", c:["Aprika","Asya","Europa","Australia"], key:"B", comp:0, p:.80},
  {q:"Kailan ipinagdiriwang ang Araw ng Kalayaan?", c:["Disyembre 30","Nobyembre 30","Agosto 21","Hunyo 12"], key:"D", comp:1, p:.75},
  {q:"Sino ang namumuno sa isang barangay?", c:["gobernador","alkalde","punong barangay","pangulo"], key:"C", comp:2, p:.82},
  {q:"Ilang taon ang termino ng Pangulo ng Pilipinas?", c:["tatlo","anim","apat","walo"], key:"B", comp:2, p:.52},
  {q:"Ano ang tawag sa pinakamataas na batas ng bansa?", c:["Saligang Batas","ordinansa","kautusan","panukala"], key:"A", comp:2, p:.58},
  {q:"Sino ang nagtatag ng Katipunan?", c:["Jose Rizal","Marcelo H. del Pilar","Andres Bonifacio","Juan Luna"], key:"C", comp:1, p:.70}]},

 ESP: {title:"Edukasyon sa Pagpapakatao", comps:["Pagmamahal sa sarili at kapwa","Katapatan at pananagutan","Pagmamahal sa bayan at sa Diyos"], items:[
  {q:"Nakita mong nahulog ang pitaka ng kaklase mo. Ano ang dapat mong gawin?", c:["Itago ito","Iwanan sa sahig","Ibalik ito sa kanya","Ibigay sa iba"], key:"C", comp:1, p:.95},
  {q:"Paano mo maipapakita ang paggalang sa nakatatanda?", c:["Sumigaw sa kanila","Magmano at gumamit ng \"po\" at \"opo\"","Hindi sila pansinin","Tumalikod sa kanila"], key:"B", comp:0, p:.93},
  {q:"May bagong kaklase kang nahihiya. Ano ang gagawin mo?", c:["Kaibiganin at isali siya","Huwag siyang kausapin","Pagtawanan siya","Isumbong siya"], key:"A", comp:0, p:.90},
  {q:"Ano ang tamang gawin sa basura?", c:["Itapon sa ilog","Ihiwalay ang nabubulok at di-nabubulok","Sunugin sa bakuran","Iwan sa daan"], key:"B", comp:2, p:.66},
  {q:"Habang tumutugtog ang Lupang Hinirang, ikaw ay:", c:["nakikipagkuwentuhan","naglalaro","kumakain","tumatayo nang tuwid at nakikinig"], key:"D", comp:2, p:.88},
  {q:"Nangako kang tutulong sa takdang-aralin ng kapatid mo. Ano ang dapat mong gawin?", c:["Sabihing ayaw mo na","Kalimutan na lang","Magdahilan","Tuparin ang pangako"], key:"D", comp:1, p:.86},
  {q:"Nangopya ka ng sagot sa pagsusulit. Ano ang tamang gawin?", c:["Ipagmalaki ito","Ulitin sa susunod","Aminin at huwag nang ulitin","Sisihin ang kaklase"], key:"C", comp:1, p:.70},
  {q:"Alin ang nagpapakita ng katapatan?", c:["Pagkuha ng hindi iyo","Pagtatago ng pagkakamali","Pagsisinungaling para hindi mapagalitan","Pagsasabi ng totoo kahit mahirap"], key:"D", comp:1, p:.87},
  {q:"Paano mo maipapakita ang pasasalamat sa Diyos?", c:["Pagiging makasarili","Pagdarasal at paggawa ng mabuti","Pakikipag-away","Pagiging tamad"], key:"B", comp:2, p:.91},
  {q:"Malungkot ang kaibigan mo dahil mababa ang marka niya. Ano ang sasabihin mo?", c:["\"Kaya mo 'yan, tutulungan kita.\"","\"Buti nga sa 'yo.\"","\"Wala akong pakialam.\"","\"Huwag ka nang mag-aral.\""], key:"A", comp:0, p:.92}]},

 MAPEH: {title:"MAPEH", comps:["Music","Arts","Physical Education","Health"], items:[
  {q:"In 4/4 time, how many beats does a whole note get?", c:["4","2","3","1"], key:"A", comp:0, p:.55},
  {q:"Which is a primary color?", c:["red","orange","green","purple"], key:"A", comp:1, p:.78},
  {q:"Which instrument is played by hitting it?", c:["guitar","violin","flute","drum"], key:"D", comp:0, p:.88},
  {q:"Which are \"Go\" foods that give us energy?", c:["fish","vegetables","rice and bread","fruits"], key:"C", comp:3, p:.66},
  {q:"At least how many times a day should you brush your teeth?", c:["twice","once","once a week","never"], key:"A", comp:3, p:.85},
  {q:"Which activity makes the heart and lungs stronger?", c:["sleeping","jogging","watching TV","sitting"], key:"B", comp:2, p:.87},
  {q:"Mixing blue and yellow makes:", c:["red","green","purple","orange"], key:"B", comp:1, p:.75},
  {q:"The tinikling is a folk dance that uses:", c:["fans","scarves","candles","bamboo poles"], key:"D", comp:2, p:.80},
  {q:"What should you do before eating?", c:["Run around","Wash your hands","Sleep","Play games"], key:"B", comp:3, p:.94},
  {q:"In music, a \"rest\" means:", c:["play louder","sing faster","silence","repeat"], key:"C", comp:0, p:.60}]},

 TLE: {title:"EPP", comps:["Home economics","Agriculture","ICT","Entrepreneurship"], items:[
  {q:"Which garden tool is used to dig and loosen soil?", c:["saw","hoe (asarol)","scissors","ladle"], key:"B", comp:1, p:.76},
  {q:"Which is a good way to save money?", c:["Keep some in a piggy bank","Spend it all on snacks","Lend it to strangers","Throw coins away"], key:"A", comp:3, p:.90},
  {q:"Which vegetable grows well in a backyard garden in the Philippines?", c:["grapes","apple","pechay","strawberry"], key:"C", comp:1, p:.80},
  {q:"What should you do first before cooking?", c:["Taste the food","Serve the food","Add salt","Wash your hands"], key:"D", comp:0, p:.88},
  {q:"Which computer part shows the output on a screen?", c:["monitor","mouse","keyboard","CPU"], key:"A", comp:2, p:.84},
  {q:"To sew a loose button, you need:", c:["tape","hammer and nail","glue","needle and thread"], key:"D", comp:0, p:.82},
  {q:"What is a computer mouse used for?", c:["typing letters","showing pictures","printing","pointing and clicking"], key:"D", comp:2, p:.78},
  {q:"Which is an example of recycling?", c:["Throwing bottles in the river","Making a plant pot from a plastic bottle","Burning paper","Buying new things"], key:"B", comp:3, p:.74},
  {q:"Which fertilizer is made from rotting plants and animal waste?", c:["chemical fertilizer","compost","plastic","sand"], key:"B", comp:1, p:.62},
  {q:"A person who starts a small business is called an:", c:["employee","customer","entrepreneur","teacher"], key:"C", comp:3, p:.58}]},
},

// ======================================================================
// JUNIOR HIGH (Grades 7–10)
// ======================================================================
JHS: {
 Math: {title:"Math", comps:["Numbers and fractions","Algebra","Geometry and measurement","Statistics and number sense"], items:[
  {q:"What is 15% of 200?", c:["15","300","20","30"], key:"D", comp:0, p:.78},
  {q:"Solve: 3x + 5 = 20. What is x?", c:["15","25/3","5","4"], key:"C", comp:1, p:.70},
  {q:"Which is a prime number?", c:["29","27","21","33"], key:"A", comp:3, p:.52},
  {q:"The angles of a triangle add up to:", c:["90°","180°","270°","360°"], key:"B", comp:2, p:.88},
  {q:"(−4) × (−6) = ?", c:["−24","−10","10","24"], key:"D", comp:0, p:.61},
  {q:"Area of a rectangle 8 cm by 5 cm?", c:["13 cm²","40 cm²","26 cm²","80 cm²"], key:"B", comp:2, p:.84},
  {q:"2/3 + 1/6 = ?", c:["5/6","3/9","1/2","3/6"], key:"A", comp:0, p:.41},
  {q:"The mean of 4, 8, 6 and 10 is:", c:["6","8","7","28"], key:"C", comp:3, p:.73},
  {q:"Which is equal to 0.75?", c:["7/5","3/4","75/10","1/75"], key:"B", comp:0, p:.80},
  {q:"If y = 2x − 1, what is y when x = 4?", c:["7","6","8","9"], key:"A", comp:1, p:.66}]},

 Science: {title:"Science", comps:["Living things","Matter","Earth and space","Force and motion"], items:[
  {q:"The basic unit of life is the:", c:["atom","cell","tissue","organ"], key:"B", comp:0, p:.90},
  {q:"Which planet is closest to the Sun?", c:["Venus","Earth","Mercury","Mars"], key:"C", comp:2, p:.74},
  {q:"At sea level, water boils at:", c:["100 °C","90 °C","50 °C","120 °C"], key:"A", comp:1, p:.81},
  {q:"Plants make their own food through:", c:["photosynthesis","respiration","digestion","evaporation"], key:"A", comp:0, p:.86},
  {q:"Which one is a mixture?", c:["salt","halo-halo","water","oxygen"], key:"B", comp:1, p:.58},
  {q:"The force that pulls things toward Earth:", c:["friction","magnetism","gravity","inertia"], key:"C", comp:3, p:.83},
  {q:"Which organ pumps blood?", c:["lungs","kidney","liver","heart"], key:"D", comp:0, p:.92},
  {q:"Mayon Volcano lies along the:", c:["Arctic Circle","equator","Prime Meridian","Ring of Fire"], key:"D", comp:2, p:.55},
  {q:"We breathe out more of which gas?", c:["oxygen","carbon dioxide","nitrogen","helium"], key:"B", comp:0, p:.63},
  {q:"A liquid with a pH of 2 is:", c:["basic","neutral","acidic","salty"], key:"C", comp:1, p:.39}]},

 English: {title:"English", comps:["Grammar","Vocabulary","Reading and writing"], items:[
  {q:"Which word is a noun? \"The teacher smiled.\"", c:["teacher","The","smiled","none"], key:"A", comp:0, p:.85},
  {q:"The plural of \"child\" is:", c:["children","childes","childs","childrens"], key:"A", comp:0, p:.88},
  {q:"A synonym of \"happy\":", c:["sad","joyful","angry","tired"], key:"B", comp:1, p:.90},
  {q:"\"She ___ to school every day.\"", c:["go","going","goes","gone"], key:"C", comp:0, p:.72},
  {q:"The opposite of \"ancient\":", c:["old","modern","huge","quiet"], key:"B", comp:1, p:.69},
  {q:"Which is a complete sentence?", c:["Running fast.","The bell rang.","Under the table.","Because of rain."], key:"B", comp:2, p:.57},
  {q:"The past tense of \"teach\":", c:["teached","teaches","teaching","taught"], key:"D", comp:0, p:.64},
  {q:"\"As busy as a bee\" is a:", c:["metaphor","noun","simile","hyperbole"], key:"C", comp:1, p:.46},
  {q:"Which is punctuated correctly?", c:["Where are you.","Where are you!","where are you?","Where are you?"], key:"D", comp:2, p:.80},
  {q:"The main idea of a paragraph is:", c:["the most important point","only the title","always the last sentence","a small detail"], key:"A", comp:2, p:.71}]},

 Filipino: {title:"Filipino", comps:["Gramatika","Talasalitaan","Panitikan","Pag-unawa sa binasa"], items:[
  {q:"\"Matamis ang mangga.\" Alin ang pang-uri?", c:["mangga","wala","ang","matamis"], key:"D", comp:0, p:.85},
  {q:"Ano ang kahulugan ng \"nagsusunog ng kilay\"?", c:["nagluluto","nag-aaral nang mabuti","nagagalit","natutulog"], key:"B", comp:1, p:.80},
  {q:"Sino ang sumulat ng \"Florante at Laura\"?", c:["Jose Rizal","Andres Bonifacio","Francisco Balagtas","Lope K. Santos"], key:"C", comp:2, p:.74},
  {q:"Ang \"Ibong Adarna\" ay isang:", c:["korido","sanaysay","dula","talambuhay"], key:"A", comp:2, p:.52},
  {q:"\"Mabilis tumakbo si Ana.\" Alin ang pang-abay?", c:["mabilis","tumakbo","Ana","si"], key:"A", comp:0, p:.66},
  {q:"Ano ang kasingkahulugan ng \"dalisay\"?", c:["marumi","malabo","maingay","puro o malinis"], key:"D", comp:1, p:.70},
  {q:"Anong uri ng pangungusap ang \"Ang ganda ng tanawin!\"?", c:["padamdam","patanong","pasalaysay","pautos"], key:"A", comp:0, p:.82},
  {q:"Kuwentong may aral at hayop ang mga tauhan:", c:["alamat","pabula","epiko","parabula"], key:"B", comp:2, p:.78},
  {q:"Ang alamat ay nagsasalaysay ng:", c:["resipe ng pagkain","buhay ng isang bayani","balita sa araw-araw","pinagmulan ng isang bagay o lugar"], key:"D", comp:2, p:.73},
  {q:"\"Kahit pagod, tinapos ni Liza ang proyekto bago matulog.\" Anong katangian ang ipinakita ni Liza?", c:["tamad","maramot","masipag at responsable","mayabang"], key:"C", comp:3, p:.90}]},

 AP: {title:"Araling Panlipunan", comps:["Heograpiya ng Asya","Kasaysayan ng daigdig","Ekonomiks","Kontemporaryong isyu"], items:[
  {q:"Ano ang pinakamalaking kontinente sa daigdig?", c:["Aprika","Hilagang Amerika","Europa","Asya"], key:"D", comp:0, p:.88},
  {q:"Ang Mesopotamia ay nasa pagitan ng mga ilog na:", c:["Nile at Congo","Tigris at Euphrates","Indus at Ganges","Huang Ho at Yangtze"], key:"B", comp:1, p:.62},
  {q:"Pag-aaral kung paano ginagamit ang limitadong pinagkukunang-yaman:", c:["Heograpiya","Sosyolohiya","Ekonomiks","Kasaysayan"], key:"C", comp:2, p:.80},
  {q:"Kapag tumaas ang presyo ng isang produkto, ang demand nito ay karaniwang:", c:["tumataas","bumababa","hindi nagbabago","nawawala"], key:"B", comp:2, p:.55},
  {q:"Ano ang pinakamataas na bundok sa daigdig?", c:["Bundok Everest","Bundok Fuji","Bundok K2","Bundok Apo"], key:"A", comp:0, p:.85},
  {q:"Saang bansa matatagpuan ang Great Wall?", c:["Hapon","India","Korea","Tsina"], key:"D", comp:1, p:.86},
  {q:"Ang pangkalahatang pagtaas ng presyo ng mga bilihin ay tinatawag na:", c:["depresyon","implasyon","resesyon","deplasyon"], key:"B", comp:2, p:.60},
  {q:"Ang \"climate change\" ay isang isyung:", c:["pangkapaligiran","pampalakasan","panrelihiyon","pang-aliwan"], key:"A", comp:3, p:.84},
  {q:"Samahan ng mga bansa sa Timog-Silangang Asya na kinabibilangan ng Pilipinas:", c:["EU","NATO","ASEAN","OPEC"], key:"C", comp:0, p:.74},
  {q:"Saang bansa nagsimula ang Renaissance?", c:["Pransiya","Inglatera","Espanya","Italya"], key:"D", comp:1, p:.48}]},

 ESP: {title:"Edukasyon sa Pagpapakatao", comps:["Pagkatao at dignidad","Konsensiya at moralidad","Pakikipagkapwa"], items:[
  {q:"Ang panloob na tinig na nagsasabi kung tama o mali ang kilos:", c:["talento","emosyon","konsensiya","hilig"], key:"C", comp:1, p:.80},
  {q:"Ang bawat tao ay may dignidad dahil siya ay:", c:["mayaman","tao","matalino","sikat"], key:"B", comp:0, p:.76},
  {q:"Nakita mong binu-bully ang kaklase mo. Ano ang pinakamabuting gawin?", c:["Manood lang","Tulungan siya at isumbong sa guro","Sumali sa pambu-bully","I-video at i-post"], key:"B", comp:2, p:.90},
  {q:"Ano ang tunay na kalayaan?", c:["Gawin ang lahat ng gusto","Walang sinusunod na batas","Pumili ng mabuti nang may pananagutan","Iwasan ang tungkulin"], key:"C", comp:1, p:.64},
  {q:"Alin ang paggalang sa opinyon ng iba?", c:["Makinig kahit hindi ka sang-ayon","Tawanan ang kanilang ideya","Putulin ang kanilang sinasabi","Balewalain sila"], key:"A", comp:2, p:.86},
  {q:"Ang birtud na nagbibigay sa bawat isa ng nararapat sa kanya:", c:["kahinahunan","katatagan","katarungan","katapangan"], key:"C", comp:1, p:.52},
  {q:"Nais mong maging guro balang araw. Ano ang dapat mong gawin ngayon?", c:["Maghintay na lang","Huwag pumasok","Umasa sa iba","Mag-aral nang mabuti"], key:"D", comp:0, p:.90},
  {q:"Ang pagtulong sa kapwa nang hindi naghihintay ng kapalit ay:", c:["pagmamalasakit","pagyayabang","pag-iimbot","pagiging maramot"], key:"A", comp:2, p:.82},
  {q:"Ang pamilya ang unang:", c:["sanhi ng problema","lugar ng trabaho","kalaban ng kabataan","paaralan ng pagmamahal at pagpapahalaga"], key:"D", comp:0, p:.84},
  {q:"Bago gumawa ng desisyon, ano ang dapat mong gawin?", c:["Sundin agad ang barkada","Magpasya nang padalos-dalos","Huwag nang mag-isip","Pag-isipan ang epekto nito sa iyo at sa iba"], key:"D", comp:1, p:.78}]},

 MAPEH: {title:"MAPEH", comps:["Music","Arts","Physical Education","Health"], items:[
  {q:"The kulintang, a set of gongs, comes from:", c:["the Cordillera","Ilocos","Bicol","Mindanao"], key:"D", comp:0, p:.58},
  {q:"How many lines does a musical staff have?", c:["5","6","4","7"], key:"A", comp:0, p:.72},
  {q:"Who painted the \"Mona Lisa\"?", c:["Michelangelo","Leonardo da Vinci","Fernando Amorsolo","Pablo Picasso"], key:"B", comp:1, p:.78},
  {q:"Fernando Amorsolo is known for paintings of:", c:["comic strips","abstract shapes","robots","sunlit Philippine countryside scenes"], key:"D", comp:1, p:.55},
  {q:"Which is a component of physical fitness?", c:["eye color","height","cardiovascular endurance","hair length"], key:"C", comp:2, p:.82},
  {q:"In volleyball, how many players per team are on the court?", c:["5","7","6","11"], key:"C", comp:2, p:.74},
  {q:"Which is a healthy way to deal with stress?", c:["Talking to someone you trust","Skipping meals","Staying up all night","Smoking"], key:"A", comp:3, p:.88},
  {q:"Which nutrient builds and repairs body tissues?", c:["carbohydrates","fats","protein","water"], key:"C", comp:3, p:.70},
  {q:"Before exercising, you should always:", c:["eat a big meal","warm up","sleep","skip water"], key:"B", comp:2, p:.86},
  {q:"Smoking mainly harms the:", c:["ears","hair","nails","lungs"], key:"D", comp:3, p:.90}]},

 TLE: {title:"TLE", comps:["Safety and tools","Cookery","Computer (ICT)","Entrepreneurship"], items:[
  {q:"What does PPE stand for?", c:["Personal Protective Equipment","Public Power Engine","Private Property Entry","Personal Planning Exercise"], key:"A", comp:0, p:.62},
  {q:"Which tool measures liquid ingredients?", c:["rolling pin","whisk","measuring cup","grater"], key:"C", comp:1, p:.80},
  {q:"Which unit measures computer storage?", c:["kilogram","gigabyte","liter","meter"], key:"B", comp:2, p:.84},
  {q:"Before using an electric tool, you should:", c:["wet your hands","use it barefoot","remove the safety guard","check the cord and plug for damage"], key:"D", comp:0, p:.86},
  {q:"What does CPU stand for?", c:["Computer Personal Unit","Central Processing Unit","Central Print Unit","Control Power Unit"], key:"B", comp:2, p:.66},
  {q:"To slow down bacteria, cold food should be kept at:", c:["40 °C","25 °C","5 °C or below","60 °C"], key:"C", comp:1, p:.45},
  {q:"A good way to price a product:", c:["cost of materials plus a fair profit","any random number","always free","double the competitor's price"], key:"A", comp:3, p:.70},
  {q:"In using a fire extinguisher (PASS), the first step is:", c:["Pull the pin","Push the button","Pour water","Press the hose"], key:"A", comp:0, p:.50},
  {q:"Which is an input device?", c:["monitor","printer","speaker","keyboard"], key:"D", comp:2, p:.82},
  {q:"A business plan helps an entrepreneur:", c:["avoid paying taxes","plan how to run and grow the business","hire relatives only","skip record keeping"], key:"B", comp:3, p:.76}]},
},

// ======================================================================
// SENIOR HIGH (Grades 11–12) — uses the SHS core subject closest to each choice
// ======================================================================
SHS: {
 Math: {title:"General Mathematics", comps:["Functions","Rational, exponential and log functions","Business math","Logic"], items:[
  {q:"If f(x) = 2x + 3, what is f(4)?", c:["11","8","10","14"], key:"A", comp:0, p:.85},
  {q:"The domain of f(x) = 1/(x − 2) is:", c:["all real numbers","x = 2 only","x > 2 only","all real numbers except 2"], key:"D", comp:1, p:.58},
  {q:"Solve: 2ˣ = 32. x = ?", c:["4","16","5","6"], key:"C", comp:1, p:.72},
  {q:"Simple interest on ₱10,000 at 5% a year for 2 years:", c:["₱500","₱1,500","₱1,000","₱10,500"], key:"C", comp:2, p:.70},
  {q:"Which is a proposition?", c:["Manila is in Luzon.","Is it raining?","Close the door.","Wow!"], key:"A", comp:3, p:.62},
  {q:"The inverse of f(x) = x + 5 is:", c:["5x","5 − x","x/5","x − 5"], key:"D", comp:0, p:.66},
  {q:"If p is true and q is false, \"p and q\" is:", c:["true","false","both","cannot tell"], key:"B", comp:3, p:.64},
  {q:"log₁₀ 1000 = ?", c:["10","3","2","100"], key:"B", comp:1, p:.55},
  {q:"Which is a one-to-one function?", c:["f(x) = x²","f(x) = 2x + 1","f(x) = |x|","f(x) = 4"], key:"B", comp:0, p:.48},
  {q:"₱1,000 at 10% compounded yearly becomes how much after 1 year?", c:["₱1,010","₱1,200","₱1,000","₱1,100"], key:"D", comp:2, p:.78}]},

 Science: {title:"Earth and Life Science", comps:["Earth science","Life science","Genetics and evolution"], items:[
  {q:"The layer of the Earth where we live is the:", c:["mantle","crust","outer core","inner core"], key:"B", comp:0, p:.88},
  {q:"Rock formed from cooled magma or lava is:", c:["sedimentary","igneous","metamorphic","fossil"], key:"B", comp:0, p:.70},
  {q:"The Philippines has many earthquakes because it lies along:", c:["tectonic plate boundaries","the equator only","a large desert","a flat plain"], key:"A", comp:0, p:.74},
  {q:"The \"powerhouse of the cell\" is the:", c:["nucleus","ribosome","vacuole","mitochondrion"], key:"D", comp:1, p:.82},
  {q:"In plant and animal cells, DNA is mainly found in the:", c:["cell wall","nucleus","cytoplasm","cell membrane"], key:"B", comp:2, p:.76},
  {q:"Which process produces sex cells (gametes)?", c:["mitosis","photosynthesis","osmosis","meiosis"], key:"D", comp:2, p:.55},
  {q:"PHIVOLCS monitors:", c:["volcanoes and earthquakes","rainfall only","road traffic","market prices"], key:"A", comp:0, p:.68},
  {q:"The theory of evolution by natural selection was proposed by:", c:["Gregor Mendel","Isaac Newton","Charles Darwin","Louis Pasteur"], key:"C", comp:2, p:.80},
  {q:"Which is a renewable energy source?", c:["coal","natural gas","geothermal","oil"], key:"C", comp:0, p:.72},
  {q:"A Punnett square predicts:", c:["the age of rocks","the weather","the possible traits of offspring","plate movement"], key:"C", comp:2, p:.60}]},

 English: {title:"Oral Communication / Reading and Writing", comps:["Oral communication","Reading and writing skills","Grammar and usage"], items:[
  {q:"The process of sending and receiving messages is called:", c:["translation","editing","communication","research"], key:"C", comp:0, p:.90},
  {q:"Which is a barrier to communication?", c:["clear words","eye contact","feedback","noise"], key:"D", comp:0, p:.82},
  {q:"A speech given with no preparation at all is:", c:["impromptu","memorized","manuscript","extemporaneous"], key:"A", comp:0, p:.60},
  {q:"The sentence that states the main idea of a paragraph:", c:["title","supporting detail","example","topic sentence"], key:"D", comp:1, p:.78},
  {q:"Which pattern of development shows similarities and differences?", c:["narration","description","definition","comparison and contrast"], key:"D", comp:1, p:.70},
  {q:"Using someone else's words or ideas without credit is:", c:["paraphrasing","citing","plagiarism","summarizing"], key:"C", comp:1, p:.84},
  {q:"\"Neither the teacher nor the students ___ late.\"", c:["is","are","was","be"], key:"B", comp:2, p:.48},
  {q:"Which is a formal expression?", c:["I would like to request a meeting.","Gonna be late.","Wanna come?","What's up?"], key:"A", comp:2, p:.86},
  {q:"A claim of policy proposes:", c:["a fact","a course of action","a value judgment","a definition"], key:"B", comp:1, p:.52},
  {q:"In an interview, the person who answers the questions is the:", c:["interviewee","interviewer","moderator","audience"], key:"A", comp:0, p:.80}]},

 Filipino: {title:"Komunikasyon at Pananaliksik", comps:["Konsepto ng wika","Kasaysayan ng wikang pambansa","Pananaliksik"], items:[
  {q:"Wikang ginagamit ng mga taong magkaiba ang unang wika upang magkaintindihan:", c:["lingua franca","dayalekto","idyolek","sosyolek"], key:"A", comp:0, p:.62},
  {q:"Ayon sa Saligang Batas ng 1987, ang pambansang wika ng Pilipinas ay:", c:["Filipino","Tagalog","Ingles","Pilipino"], key:"A", comp:1, p:.70},
  {q:"Ang natatanging paraan ng pagsasalita ng isang tao ay tinatawag na:", c:["sosyolek","idyolek","dayalekto","register"], key:"B", comp:0, p:.55},
  {q:"Anong buwan ipinagdiriwang ang Buwan ng Wikang Pambansa?", c:["Marso","Hunyo","Disyembre","Agosto"], key:"D", comp:1, p:.86},
  {q:"Sino ang tinaguriang \"Ama ng Wikang Pambansa\"?", c:["Jose Rizal","Andres Bonifacio","Lope K. Santos","Manuel L. Quezon"], key:"D", comp:1, p:.78},
  {q:"Ang wikang ginagamit sa isang partikular na rehiyon o lugar ay:", c:["idyolek","creole","pidgin","dayalekto"], key:"D", comp:0, p:.66},
  {q:"Ano ang unang hakbang sa pananaliksik?", c:["paglalathala","pagpili ng paksa","pagsulat ng konklusyon","pagbibigay ng marka"], key:"B", comp:2, p:.80},
  {q:"Ang listahan ng mga sangguniang ginamit sa pananaliksik:", c:["abstrak","introduksiyon","bibliograpiya","apendiks"], key:"C", comp:2, p:.74},
  {q:"Wikang nabuo mula sa pidgin at naging unang wika ng isang komunidad:", c:["idyolek","creole","sosyolek","register"], key:"B", comp:0, p:.50},
  {q:"Ahensiyang nangangalaga at nagpapaunlad ng wikang Filipino:", c:["DepEd","CHED","Komisyon sa Wikang Filipino","DOST"], key:"C", comp:1, p:.72}]},

 AP: {title:"Understanding Culture, Society and Politics", comps:["Culture","Society","Politics and governance"], items:[
  {q:"The study of human societies and social behavior is:", c:["sociology","geology","astronomy","botany"], key:"A", comp:1, p:.84},
  {q:"Judging other cultures by the standards of your own is called:", c:["ethnocentrism","cultural relativism","enculturation","acculturation"], key:"A", comp:0, p:.60},
  {q:"Learning your own culture as you grow up is called:", c:["assimilation","acculturation","enculturation","migration"], key:"C", comp:0, p:.55},
  {q:"Which is an example of material culture?", c:["beliefs","language","values","the jeepney"], key:"D", comp:0, p:.74},
  {q:"The family, school and church are examples of:", c:["political parties","tribes","corporations","social institutions"], key:"D", comp:1, p:.78},
  {q:"A government where power comes from the people is a:", c:["monarchy","democracy","dictatorship","theocracy"], key:"B", comp:2, p:.86},
  {q:"The three branches of the Philippine government are:", c:["national, provincial and barangay","executive, legislative and judicial","army, navy and air force","DepEd, DOH and DSWD"], key:"B", comp:2, p:.72},
  {q:"Social mobility means:", c:["moving to another house","moving up or down the social ladder","using social media","owning a vehicle"], key:"B", comp:1, p:.62},
  {q:"In the Philippines, the minimum voting age for national elections is:", c:["16","21","18","25"], key:"C", comp:2, p:.80},
  {q:"Modern humans belong to the species:", c:["Homo erectus","Homo habilis","Australopithecus","Homo sapiens"], key:"D", comp:0, p:.58}]},

 ESP: {title:"Personal Development", comps:["Knowing oneself","Developmental stages","Mental health and wellness","Relationships"], items:[
  {q:"Adolescence is the stage between:", c:["infancy and childhood","childhood and adulthood","adulthood and old age","birth and infancy"], key:"B", comp:1, p:.84},
  {q:"A healthy way to manage stress:", c:["regular exercise and enough sleep","skipping meals","isolating yourself","gaming all night"], key:"A", comp:2, p:.86},
  {q:"Knowing your own strengths and weaknesses is:", c:["self-pity","self-awareness","selfishness","self-doubt"], key:"B", comp:0, p:.82},
  {q:"In Maslow's hierarchy, the most basic needs are:", c:["physiological needs","esteem","self-actualization","belonging"], key:"A", comp:0, p:.55},
  {q:"Which may show that a friend needs mental health support?", c:["laughing at a joke","getting good grades","long sadness and pulling away from others","joining a club"], key:"C", comp:2, p:.80},
  {q:"Which is a sign of a healthy relationship?", c:["constant jealousy","checking their phone","respect and trust","controlling who they see"], key:"C", comp:3, p:.88},
  {q:"The body changes of puberty are mainly triggered by:", c:["hormones","the weather","school work","diet only"], key:"A", comp:1, p:.62},
  {q:"Emotional intelligence is the ability to:", c:["solve math quickly","memorize facts","understand and manage emotions","speak many languages"], key:"C", comp:0, p:.70},
  {q:"At school, who can you talk to about personal problems?", c:["no one","only the canteen staff","strangers online","a guidance counselor"], key:"D", comp:2, p:.85},
  {q:"Goals that are specific, measurable and time-bound follow the:", c:["FAST method","YOLO rule","ABC rule","SMART method"], key:"D", comp:0, p:.58}]},

 MAPEH: {title:"PE and Health", comps:["Fitness assessment","Exercise and sports","Health and nutrition"], items:[
  {q:"FITT stands for Frequency, Intensity, Time and:", c:["Training","Tempo","Type","Target"], key:"C", comp:0, p:.55},
  {q:"Which is an aerobic activity?", c:["lifting heavy weights","a 10-meter sprint","brisk walking for 30 minutes","stretching"], key:"C", comp:1, p:.66},
  {q:"Body Mass Index (BMI) is computed from:", c:["age and sex","weight and height","heart rate","waist size only"], key:"B", comp:0, p:.70},
  {q:"Cool-down exercises help the body:", c:["return slowly to its resting state","gain weight","build bones fast","stay hot"], key:"A", comp:1, p:.78},
  {q:"About how much water should a teenager drink a day?", c:["about 8 glasses","1 glass","20 glasses","only soft drinks"], key:"A", comp:2, p:.80},
  {q:"A sign of overtraining is:", c:["better sleep","more energy","constant tiredness and frequent injuries","faster recovery"], key:"C", comp:1, p:.64},
  {q:"Which foods are rich in protein?", c:["fish, eggs and beans","rice and bread","fruits","cooking oils"], key:"A", comp:2, p:.74},
  {q:"A target heart rate is used to check:", c:["number of steps","exercise intensity","blood type","height"], key:"B", comp:0, p:.52},
  {q:"Which activity builds muscular strength?", c:["reading","watching sports","sleeping","push-ups"], key:"D", comp:1, p:.86},
  {q:"Which is a risky health behavior?", c:["eating vegetables","sleeping 8 hours","drinking water","vaping"], key:"D", comp:2, p:.88}]},

 TLE: {title:"Empowerment Technologies", comps:["Online safety and ethics","Productivity tools","Web and ICT concepts"], items:[
  {q:"Which is the safest password?", c:["123456","your birthday","password","Lk7#qP9!vR"], key:"D", comp:0, p:.82},
  {q:"Phishing is:", c:["tricking people into giving personal information","a fishing hobby app","a virus cleaner","a type of email server"], key:"A", comp:0, p:.70},
  {q:"In a spreadsheet, which formula adds A1 to A5?", c:["=ADD(A1-A5)","SUM A1+A5","=SUM(A1:A5)","=TOTAL(A1;A5)"], key:"C", comp:1, p:.72},
  {q:"Mail merge is used to:", c:["fix spelling","create personalized letters for many people","draw charts","compress files"], key:"B", comp:1, p:.58},
  {q:"Web 2.0 lets users:", c:["only read pages","print web pages","turn off the internet","create and share content"], key:"D", comp:2, p:.60},
  {q:"Netiquette means:", c:["a type of browser","good manners online","an internet speed","a computer part"], key:"B", comp:0, p:.84},
  {q:"If you use a photo from the internet in your project, you should:", c:["claim it as yours","remove the watermark","give credit to the source","sell it"], key:"C", comp:0, p:.80},
  {q:"Which file type is commonly used for photos?", c:[".jpg",".xlsx",".docx",".mp3"], key:"A", comp:2, p:.78},
  {q:"A hyperlink:", c:["connects to another page or file","deletes a file","prints the page","locks the screen"], key:"A", comp:2, p:.74},
  {q:"Cyberbullying should be:", c:["ignored forever","answered with more insults","shared with friends","reported to a trusted adult or the school"], key:"D", comp:0, p:.86}]},
},
};
