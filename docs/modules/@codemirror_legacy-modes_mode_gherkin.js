async function moduleInitFunction(require,exports={}){Object.defineProperty(exports,"__esModule",{value:!0});return exports.gherkin={startState:function(){return{lineNumber:0,tableHeaderLine:!1,allowFeature:!0,allowBackground:!1,allowScenario:!1,allowSteps:!1,allowPlaceholders:!1,allowMultilineArgument:!1,inMultilineString:!1,inMultilineTable:!1,inKeywordLine:!1}},token:function(stream,state){if(stream.sol()&&(state.lineNumber++,state.inKeywordLine=!1,state.inMultilineTable&&(state.tableHeaderLine=!1,!stream.match(/\s*\|/,!1)&&(state.allowMultilineArgument=!1,state.inMultilineTable=!1))),stream.eatSpace(),state.allowMultilineArgument){// STRING
if(state.inMultilineString)return stream.match("\"\"\"")?(state.inMultilineString=!1,state.allowMultilineArgument=!1):stream.match(/.*/),"string";// TABLE
if(state.inMultilineTable)return stream.match(/\|\s*/)?"bracket":(stream.match(/[^\|]*/),state.tableHeaderLine?"header":"string");// DETECT START
if(stream.match("\"\"\""))return state.inMultilineString=!0,"string";if(stream.match("|"))return state.inMultilineTable=!0,state.tableHeaderLine=!0,"bracket"}// LINE COMMENT
return stream.match(/#.*/)?"comment":!state.inKeywordLine&&stream.match(/@\S+/)?"tag":!state.inKeywordLine&&state.allowFeature&&stream.match(/(機能|功能|フィーチャ|기능|โครงหลัก|ความสามารถ|ความต้องการทางธุรกิจ|ಹೆಚ್ಚಳ|గుణము|ਮੁਹਾਂਦਰਾ|ਨਕਸ਼ ਨੁਹਾਰ|ਖਾਸੀਅਤ|रूप लेख|وِیژگی|خاصية|תכונה|Функціонал|Функция|Функционалност|Функционал|Үзенчәлеклелек|Свойство|Особина|Мөмкинлек|Могућност|Λειτουργία|Δυνατότητα|Właściwość|Vlastnosť|Trajto|Tính năng|Savybė|Pretty much|Požiadavka|Požadavek|Potrzeba biznesowa|Özellik|Osobina|Ominaisuus|Omadus|OH HAI|Mogućnost|Mogucnost|Jellemző|Hwæt|Hwaet|Funzionalità|Funktionalitéit|Funktionalität|Funkcja|Funkcionalnost|Funkcionalitāte|Funkcia|Fungsi|Functionaliteit|Funcționalitate|Funcţionalitate|Functionalitate|Funcionalitat|Funcionalidade|Fonctionnalité|Fitur|Fīča|Feature|Eiginleiki|Egenskap|Egenskab|Característica|Caracteristica|Business Need|Aspekt|Arwedd|Ahoy matey!|Ability):/)?(state.allowScenario=!0,state.allowBackground=!0,state.allowPlaceholders=!1,state.allowSteps=!1,state.allowMultilineArgument=!1,state.inKeywordLine=!0,"keyword"):!state.inKeywordLine&&state.allowBackground&&stream.match(/(背景|배경|แนวคิด|ಹಿನ್ನೆಲೆ|నేపథ్యం|ਪਿਛੋਕੜ|पृष्ठभूमि|زمینه|الخلفية|רקע|Тарих|Предыстория|Предистория|Позадина|Передумова|Основа|Контекст|Кереш|Υπόβαθρο|Założenia|Yo\-ho\-ho|Tausta|Taust|Situācija|Rerefons|Pozadina|Pozadie|Pozadí|Osnova|Latar Belakang|Kontext|Konteksts|Kontekstas|Kontekst|Háttér|Hannergrond|Grundlage|Geçmiş|Fundo|Fono|First off|Dis is what went down|Dasar|Contexto|Contexte|Context|Contesto|Cenário de Fundo|Cenario de Fundo|Cefndir|Bối cảnh|Bakgrunnur|Bakgrunn|Bakgrund|Baggrund|Background|B4|Antecedents|Antecedentes|Ær|Aer|Achtergrond):/)?(state.allowPlaceholders=!1,state.allowSteps=!0,state.allowBackground=!1,state.allowMultilineArgument=!1,state.inKeywordLine=!0,"keyword"):!state.inKeywordLine&&state.allowScenario&&stream.match(/(場景大綱|场景大纲|劇本大綱|剧本大纲|テンプレ|シナリオテンプレート|シナリオテンプレ|シナリオアウトライン|시나리오 개요|สรุปเหตุการณ์|โครงสร้างของเหตุการณ์|ವಿವರಣೆ|కథనం|ਪਟਕਥਾ ਰੂਪ ਰੇਖਾ|ਪਟਕਥਾ ਢਾਂਚਾ|परिदृश्य रूपरेखा|سيناريو مخطط|الگوی سناریو|תבנית תרחיש|Сценарийның төзелеше|Сценарий структураси|Структура сценарію|Структура сценария|Структура сценарија|Скица|Рамка на сценарий|Концепт|Περιγραφή Σεναρίου|Wharrimean is|Template Situai|Template Senario|Template Keadaan|Tapausaihio|Szenariogrundriss|Szablon scenariusza|Swa hwær swa|Swa hwaer swa|Struktura scenarija|Structură scenariu|Structura scenariu|Skica|Skenario konsep|Shiver me timbers|Senaryo taslağı|Schema dello scenario|Scenariomall|Scenariomal|Scenario Template|Scenario Outline|Scenario Amlinellol|Scenārijs pēc parauga|Scenarijaus šablonas|Reckon it's like|Raamstsenaarium|Plang vum Szenario|Plan du Scénario|Plan du scénario|Osnova scénáře|Osnova Scenára|Náčrt Scenáru|Náčrt Scénáře|Náčrt Scenára|MISHUN SRSLY|Menggariskan Senario|Lýsing Dæma|Lýsing Atburðarásar|Konturo de la scenaro|Koncept|Khung tình huống|Khung kịch bản|Forgatókönyv vázlat|Esquema do Cenário|Esquema do Cenario|Esquema del escenario|Esquema de l'escenari|Esbozo do escenario|Delineação do Cenário|Delineacao do Cenario|All y'all|Abstrakt Scenario|Abstract Scenario):/)?(state.allowPlaceholders=!0,state.allowSteps=!0,state.allowMultilineArgument=!1,state.inKeywordLine=!0,"keyword"):state.allowScenario&&stream.match(/(例子|例|サンプル|예|ชุดของเหตุการณ์|ชุดของตัวอย่าง|ಉದಾಹರಣೆಗಳು|ఉదాహరణలు|ਉਦਾਹਰਨਾਂ|उदाहरण|نمونه ها|امثلة|דוגמאות|Үрнәкләр|Сценарији|Примеры|Примери|Приклади|Мисоллар|Мисаллар|Σενάρια|Παραδείγματα|You'll wanna|Voorbeelden|Variantai|Tapaukset|Se þe|Se the|Se ðe|Scenarios|Scenariji|Scenarijai|Przykłady|Primjeri|Primeri|Příklady|Príklady|Piemēri|Példák|Pavyzdžiai|Paraugs|Örnekler|Juhtumid|Exemplos|Exemples|Exemple|Exempel|EXAMPLZ|Examples|Esempi|Enghreifftiau|Ekzemploj|Eksempler|Ejemplos|Dữ liệu|Dead men tell no tales|Dæmi|Contoh|Cenários|Cenarios|Beispiller|Beispiele|Atburðarásir):/)?(state.allowPlaceholders=!1,state.allowSteps=!0,state.allowBackground=!1,state.allowMultilineArgument=!0,"keyword"):!state.inKeywordLine&&state.allowScenario&&stream.match(/(場景|场景|劇本|剧本|シナリオ|시나리오|เหตุการณ์|ಕಥಾಸಾರಾಂಶ|సన్నివేశం|ਪਟਕਥਾ|परिदृश्य|سيناريو|سناریو|תרחיש|Сценарій|Сценарио|Сценарий|Пример|Σενάριο|Tình huống|The thing of it is|Tapaus|Szenario|Swa|Stsenaarium|Skenario|Situai|Senaryo|Senario|Scenaro|Scenariusz|Scenariu|Scénario|Scenario|Scenarijus|Scenārijs|Scenarij|Scenarie|Scénář|Scenár|Primer|MISHUN|Kịch bản|Keadaan|Heave to|Forgatókönyv|Escenario|Escenari|Cenário|Cenario|Awww, look mate|Atburðarás):/)?(state.allowPlaceholders=!1,state.allowSteps=!0,state.allowBackground=!1,state.allowMultilineArgument=!1,state.inKeywordLine=!0,"keyword"):!state.inKeywordLine&&state.allowSteps&&stream.match(/(那麼|那么|而且|當|当|并且|同時|同时|前提|假设|假設|假定|假如|但是|但し|並且|もし|ならば|ただし|しかし|かつ|하지만|조건|먼저|만일|만약|단|그리고|그러면|และ |เมื่อ |แต่ |ดังนั้น |กำหนดให้ |ಸ್ಥಿತಿಯನ್ನು |ಮತ್ತು |ನೀಡಿದ |ನಂತರ |ಆದರೆ |మరియు |చెప్పబడినది |కాని |ఈ పరిస్థితిలో |అప్పుడు |ਪਰ |ਤਦ |ਜੇਕਰ |ਜਿਵੇਂ ਕਿ |ਜਦੋਂ |ਅਤੇ |यदि |परन्तु |पर |तब |तदा |तथा |जब |चूंकि |किन्तु |कदा |और |अगर |و |هنگامی |متى |لكن |عندما |ثم |بفرض |با فرض |اما |اذاً |آنگاه |כאשר |וגם |בהינתן |אזי |אז |אבל |Якщо |Һәм |Унда |Тоді |Тогда |То |Также |Та |Пусть |Припустимо, що |Припустимо |Онда |Но |Нехай |Нәтиҗәдә |Лекин |Ләкин |Коли |Когда |Когато |Када |Кад |К тому же |І |И |Задато |Задати |Задате |Если |Допустим |Дано |Дадено |Вә |Ва |Бирок |Әмма |Әйтик |Әгәр |Аммо |Али |Але |Агар |А також |А |Τότε |Όταν |Και |Δεδομένου |Αλλά |Þurh |Þegar |Þa þe |Þá |Þa |Zatati |Zakładając |Zadato |Zadate |Zadano |Zadani |Zadan |Za předpokladu |Za predpokladu |Youse know when youse got |Youse know like when |Yna |Yeah nah |Y'know |Y |Wun |Wtedy |When y'all |When |Wenn |WEN |wann |Ve |Và |Und |Un |ugeholl |Too right |Thurh |Thì |Then y'all |Then |Tha the |Tha |Tetapi |Tapi |Tak |Tada |Tad |Stel |Soit |Siis |Și |Şi |Si |Sed |Se |Så |Quando |Quand |Quan |Pryd |Potom |Pokud |Pokiaľ |Però |Pero |Pak |Oraz |Onda |Ond |Oletetaan |Og |Och |O zaman |Niin |Nhưng |När |Når |Mutta |Men |Mas |Maka |Majd |Mając |Mais |Maar |mä |Ma |Lorsque |Lorsqu'|Logo |Let go and haul |Kun |Kuid |Kui |Kiedy |Khi |Ketika |Kemudian |Keď |Když |Kaj |Kai |Kada |Kad |Jeżeli |Jeśli |Ja |It's just unbelievable |Ir |I CAN HAZ |I |Ha |Givun |Givet |Given y'all |Given |Gitt |Gegeven |Gegeben seien |Gegeben sei |Gdy |Gangway! |Fakat |Étant donnés |Etant donnés |Étant données |Etant données |Étant donnée |Etant donnée |Étant donné |Etant donné |Et |És |Entonces |Entón |Então |Entao |En |Eğer ki |Ef |Eeldades |E |Ðurh |Duota |Dun |Donitaĵo |Donat |Donada |Do |Diyelim ki |Diberi |Dengan |Den youse gotta |DEN |De |Dato |Dați fiind |Daţi fiind |Dati fiind |Dati |Date fiind |Date |Data |Dat fiind |Dar |Dann |dann |Dan |Dados |Dado |Dadas |Dada |Ða ðe |Ða |Cuando |Cho |Cando |Când |Cand |Cal |But y'all |But at the end of the day I reckon |BUT |But |Buh |Blimey! |Biết |Bet |Bagi |Aye |awer |Avast! |Atunci |Atesa |Atès |Apabila |Anrhegedig a |Angenommen |And y'all |And |AN |An |an |Amikor |Amennyiben |Ama |Als |Alors |Allora |Ali |Aleshores |Ale |Akkor |Ak |Adott |Ac |Aber |A zároveň |A tiež |A taktiež |A také |A |a |7 |\* )/)?(state.inStep=!0,state.allowPlaceholders=!0,state.allowMultilineArgument=!0,state.inKeywordLine=!0,"keyword"):stream.match(/"[^"]*"?/)?"string":state.allowPlaceholders&&stream.match(/<[^>]*>?/)?"variable":(stream.next(),stream.eatWhile(/[^@"<#]/),null)}},exports}