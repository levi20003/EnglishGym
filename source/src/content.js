/* ================= CONTENT ================= */
const LEVELS=["A2","B1","B2","C1"];
const ALL_LEVELS=["A1","A2","B1","B2","C1","C2"];
const CATS=["articles","prepositions","present perfect","past tenses","tenses (other)","question formation","word order","conditionals","passive","verb patterns","countables","subject-verb agreement","collocations","linkers","vocabulary","naturalness & register","spelling & punctuation","other"];
const SKILLS=[["grammar","Grammar & vocabulary"],["reading","Reading"],["listening","Listening"],["writing","Writing"],["speaking","Speaking"]];

/* Vocabulary. Order of the first 60 items must never change: card ids are "d"+index and your review history is keyed on them.
   Fields: w, pos/cat, hu (Hungarian meaning), def, ex, track (gen|it), lvl, syn?, ant?, note? */
const DECK_RAW=[
["get the hang of","expression","ráérez, belejön","to learn how to do something after some practice","After a week I finally got the hang of the new keyboard shortcuts.","gen","B1"],
["look forward to","phrasal verb","(örömmel) vár valamit","to feel happy about something that will happen","I'm looking forward to the summer break.","gen","B1"],
["put off","phrasal verb","elhalaszt, halogat","to delay doing something","Stop putting off your thesis and write one page today.","gen","B1",{syn:"postpone, delay"}],
["figure out","phrasal verb","rájön, kitalál","to understand or solve something after thinking","I can't figure out why the test keeps failing.","gen","B1",{syn:"work out"}],
["come up with","phrasal verb","kitalál (ötletet), előáll valamivel","to think of an idea or plan","We need to come up with a name for the app.","gen","B1"],
["turn down","phrasal verb","visszautasít","to refuse an offer or request","She turned down the job because the salary was too low.","gen","B1",{syn:"reject, decline",ant:"accept"}],
["make sense","collocation","van értelme, érthető","to be clear and logical","Does this explanation make sense to you?","gen","A2"],
["take part in","collocation","részt vesz valamiben","to join an activity","Over 200 students took part in the hackathon.","gen","A2",{syn:"participate in"}],
["on the other hand","linker","másrészt","used to give a contrasting point","The city is expensive. On the other hand, the salaries are higher.","gen","B1"],
["nevertheless","linker","mindazonáltal, ennek ellenére","despite what was just said","The task was hard; nevertheless, we finished on time.","gen","B2",{syn:"however, even so"}],
["whereas","linker","míg, ezzel szemben","compares two different facts","I prefer backend work, whereas my friend loves design.","gen","B2"],
["reluctant","word","vonakodó, nem szívesen tesz valamit","not willing to do something","He was reluctant to speak English in class at first.","gen","B2",{syn:"unwilling",ant:"eager"}],
["overwhelmed","word","túlterhelt, elárasztott (érzés)","having too much to deal with","I felt overwhelmed during the exam period.","gen","B1"],
["straightforward","word","egyszerű, egyértelmű","easy to understand or do","The installation is pretty straightforward.","gen","B2",{syn:"simple",ant:"complicated"}],
["thorough","word","alapos","careful and complete","She did a thorough review of the code.","gen","B2",{syn:"careful, detailed",ant:"careless"}],
["eventually","word","végül (hosszabb idő után)","in the end, after a long time","Eventually we found the bug in the config file.","gen","B1",{note:"False friend: it does NOT mean 'esetleg'. For 'esetleg' say 'possibly' or 'maybe'."}],
["a piece of cake","idiom","gyerekjáték","something very easy","The first assignment was a piece of cake.","gen","B1"],
["break the ice","idiom","megtöri a jeget","to make people feel relaxed in a new situation","He told a joke to break the ice at the meeting.","gen","B2"],
["cut corners","idiom","összecsap valamit, a minőség rovására spórol","to do something badly to save time or money","If you cut corners on testing, users will find the bugs.","gen","B2"],
["the bottom line","idiom","a lényeg","the most important fact","The bottom line is that we need more users.","gen","C1"],
["make ends meet","idiom","kijön a pénzéből","to have just enough money to live","Many students work part-time to make ends meet.","gen","B2"],
["commute","word","ingázás; ingázik","the regular journey to work or school","My commute to the university takes 20 minutes by tram.","gen","B1"],
["take for granted","expression","természetesnek vesz","to not value something because it is always there","We take fast internet for granted.","gen","B2"],
["drawback","word","hátrány","a disadvantage","The main drawback of remote work is isolation.","gen","B2",{syn:"disadvantage, downside",ant:"advantage"}],
["inevitable","word","elkerülhetetlen","certain to happen","Some mistakes are inevitable when you learn a language.","gen","C1",{syn:"unavoidable"}],
["nuance","word","árnyalat, finom különbség","a very small difference in meaning","Native speakers notice the nuance between 'job' and 'career'.","gen","C1"],
["albeit","linker","bár, habár (formális)","although (formal)","The plan worked, albeit more slowly than expected.","gen","C1"],
["keep in mind","expression","észben tart","to remember something important","Keep in mind that the deadline is Friday.","gen","B1",{syn:"bear in mind"}],
["to be honest","expression","őszintén szólva","used before saying what you really think","To be honest, I didn't enjoy the film.","gen","A2"],
["run out of","phrasal verb","kifogy valamiből","to have none left","We ran out of time before the last question.","gen","B1"],
["deploy","IT term","élesít, telepít (éles környezetbe)","to release software so it runs in production","We deploy a new version every Thursday.","it","B1"],
["deadline","business term","határidő","the time by which something must be finished","The deadline for the project report is next Monday.","it","A2"],
["stakeholder","business term","érintett fél, érdekelt fél","a person with an interest in a project or company","We presented the prototype to the main stakeholders.","it","B2"],
["scalable","IT term","skálázható","able to grow and handle more users or data","The architecture needs to be scalable to a million users.","it","B2"],
["bottleneck","IT term","szűk keresztmetszet","a point where a process slows down","The database query is the bottleneck of the whole app.","it","B2"],
["requirements","IT term","követelmények","what a system must do","The client changed the requirements twice this sprint.","it","B1"],
["sprint","IT term","sprint (rövid, fix fejlesztési ciklus)","a short fixed work period in Scrum","In this sprint we focus on the payment feature.","it","B1"],
["stand-up","IT term","napi rövid csapatmegbeszélés","a short daily team meeting","In the stand-up I said what I did yesterday and what I'll do today.","it","B1"],
["backlog","IT term","teendőlista, hátralék","a list of tasks still to be done","Let's add that idea to the backlog.","it","B1"],
["workaround","IT term","kerülőmegoldás","a temporary way to avoid a problem","There's no fix yet, but there is a workaround.","it","B2"],
["troubleshoot","IT term","hibát keres és elhárít","to find and fix problems","I spent the morning troubleshooting the network.","it","B2"],
["legacy system","IT term","örökölt (régi, még használt) rendszer","an old system still in use","Many banks still run legacy systems written in COBOL.","it","B2"],
["revenue","business term","árbevétel","money a company earns from sales","Our revenue grew by 15% this quarter.","it","B1"],
["profit margin","business term","haszonkulcs, profitráta","the percentage of revenue that is profit","Software has a higher profit margin than hardware.","it","B2"],
["ROI","business term","megtérülés (befektetésarányos)","return on investment: profit compared to cost","The ROI of the new CRM system was positive after one year.","it","B2"],
["KPI","business term","kulcs teljesítménymutató","key performance indicator: a measurable goal","Our main KPI is monthly active users.","it","B2"],
["outsource","business term","kiszervez","to pay another company to do work","They outsource customer support to a firm in Portugal.","it","B2"],
["data breach","IT term","adatszivárgás, adatvédelmi incidens","an incident where private data is stolen","The data breach affected two million customers.","it","B2"],
["compliance","business term","(szabályoknak való) megfelelés","following laws and rules, e.g. GDPR","GDPR compliance is required for all EU customers.","it","C1"],
["leverage","business term","kihasznál, kiaknáz","to use something to get the best result","We can leverage cloud services to cut costs.","it","C1"],
["streamline","business term","egyszerűsít, hatékonyabbá tesz","to make a process simpler and more efficient","The new tool streamlines our invoicing process.","it","C1"],
["benchmark","IT term","viszonyítási alap; teljesítményt mér","a standard to compare performance","We benchmarked three databases before choosing one.","it","B2"],
["follow up","phrasal verb","utánanéz, később visszajelez","to contact someone again about something","I'll follow up with an email after the meeting.","it","B1"],
["touch base","idiom","röviden egyeztet","to briefly contact someone","Let's touch base on Friday about the release.","it","B2"],
["on the same page","idiom","ugyanazt érti, egyetért","to agree and understand the same thing","Before coding, let's make sure we're on the same page.","it","B2"],
["ballpark figure","idiom","hozzávetőleges becslés","a rough estimate","Can you give me a ballpark figure for the cost?","it","C1"],
["user-friendly","word","felhasználóbarát","easy for people to use","The new dashboard is much more user-friendly.","it","B1"],
["feasibility","business term","megvalósíthatóság","how possible or practical something is","We did a feasibility study before the project.","it","C1"],
["roll out","phrasal verb","(fokozatosan) bevezet","to introduce a new product or system gradually","We'll roll out the update to 10% of users first.","it","B2"],
["attachment","word","csatolmány","a file sent with an email","Please find the report attached.","it","A2"],
/* ---- added in 2.0 ---- */
["make a decision","collocation","döntést hoz","to decide something","We need to make a decision by Friday.","gen","B1",{note:"Not 'do a decision' or 'bring a decision' (hozni → make)."}],
["solve a problem","collocation","megold egy problémát","to find an answer to a problem","Restarting the router solved the problem.","gen","A2"],
["gain experience","collocation","tapasztalatot szerez","to get practical knowledge by doing something","I want to gain experience in IT support before I specialise.","it","B1"],
["meet a deadline","collocation","tartja a határidőt","to finish something on time","We worked late to meet the deadline.","it","B1",{ant:"miss a deadline"}],
["miss a deadline","collocation","lekési a határidőt","to not finish something on time","If we miss the deadline, the client will pay less.","it","B1"],
["troubleshoot a network issue","collocation","hálózati hibát hárít el","to find and fix a problem with a network","I spent an hour troubleshooting a network issue in the lab.","it","B2"],
["deploy an application","collocation","alkalmazást élesít","to put an application into production","We deploy the application with one command.","it","B1"],
["raise a concern","collocation","aggályt vet fel","to say that you are worried about something","She raised a concern about data privacy.","it","B2"],
["run a meeting","collocation","megbeszélést vezet","to lead a meeting","Our team lead runs the meeting every Monday.","it","B2"],
["take responsibility for","collocation","felelősséget vállal valamiért","to accept that something is your job or your fault","I take full responsibility for the mistake.","gen","B1"],
["pay attention to","collocation","figyel valamire","to watch, listen or think carefully","Pay attention to the error code, not just the message.","gen","A2"],
["do research","collocation","kutatást végez, utánanéz","to study a subject carefully to find information","I did some research before the interview.","gen","B1",{note:"'research' is uncountable: some research, not 'a research'."}],
["make progress","collocation","halad, fejlődik","to get better or move forward","I'm making progress with my listening.","gen","B1"],
["have a look at","expression","ránéz, megnéz","to look at something quickly","Could you have a look at my code?","it","A2"],
["set up","phrasal verb","beállít, létrehoz","to prepare or configure something","Can you set up a new account for the intern?","it","B1"],
["back up","phrasal verb","biztonsági mentést készít","to make a copy of data in case it is lost","Always back up your files before an update.","it","B1"],
["log in","phrasal verb","bejelentkezik","to enter your username and password","I can't log in to my email.","it","A2"],
["reset a password","collocation","jelszót visszaállít","to change a password so the user can log in again","I reset her password and asked her to change it.","it","A2"],
["reboot","IT term","újraindít","to restart a computer or device","Have you tried rebooting the router?","it","A2",{syn:"restart"}],
["bandwidth","IT term","sávszélesség; (átvitt) szabad kapacitás","the amount of data a connection can carry; informally, time or energy","I don't have the bandwidth for another project this week.","it","B2"],
["latency","IT term","késleltetés","the delay before data is transferred","High latency makes video calls frustrating.","it","B2"],
["firewall","IT term","tűzfal","a system that blocks unwanted network traffic","The firewall blocked the connection to port 22.","it","B1"],
["phishing","IT term","adathalászat","fake messages that try to steal passwords or data","The email was a phishing attempt to steal passwords.","it","B1"],
["two-factor authentication","IT term","kétlépcsős azonosítás","logging in with a password plus a second check, such as a code","Turn on two-factor authentication for your bank account.","it","B1"],
["query","IT term","lekérdezés; lekérdez","a request for data from a database","This SQL query returns all active customers.","it","B1"],
["primary key","IT term","elsődleges kulcs","a column that uniquely identifies each row in a table","Each table needs a primary key.","it","B2"],
["redundancy","IT term","redundancia, tartalék (rendszer); (munkahelyen) leépítés","extra parts that keep a system running if one fails","We added redundancy so the service stays up if one server fails.","it","C1"],
["ticket","IT term","hibajegy","a support request recorded in a system","Please open a ticket and the support team will contact you.","it","B1"],
["escalate","IT term","továbbít magasabb szintre (eszkalál)","to pass a problem to someone more senior","If I can't solve it, I escalate the ticket to second-line support.","it","B2"],
["reproduce a bug","collocation","reprodukál egy hibát","to make a bug happen again on purpose to study it","I can't reproduce the bug on my machine.","it","B2"],
["root cause","IT term","kiváltó ok","the original reason for a problem","We still don't know the root cause of the outage.","it","B2"],
["outage","IT term","kiesés, leállás","a period when a service is not working","The outage lasted two hours.","it","B2",{syn:"downtime"}],
["cash flow","business term","pénzforgalom, cash flow","money moving in and out of a business","Many start-ups fail because of cash flow problems.","it","B2"],
["invest in","collocation","befektet valamibe","to put money into something to make a profit","He invests in index funds every month.","it","B1"],
["diversify","business term","diverzifikál, megosztja (a kockázatot)","to spread money across different investments","It's safer to diversify your investments.","it","C1"],
["share price","business term","részvényárfolyam","the price of one share of a company","The share price fell after the announcement.","it","B2"],
["make a profit","collocation","nyereséget termel","to earn more than you spend","The company made a profit for the first time last year.","it","B1",{ant:"make a loss"}],
["negotiate","business term","tárgyal, alkudozik","to discuss something to reach an agreement","We negotiated a better price with the supplier.","it","B2"],
["agenda","business term","napirend","a list of topics for a meeting","What's on the agenda for today's meeting?","it","B1",{note:"Not 'agenda' as in 'határidőnapló/naptár'."}],
["action item","business term","teendő (megbeszélés után)","a task someone must do after a meeting","Let's go through the action items before we finish.","it","B2"],
["by the way","expression","egyébként, apropó","used to add a new topic","By the way, the meeting moved to three.","gen","A2"],
["I'm not sure I follow","expression","nem biztos, hogy értem","a polite way to say you don't understand","Sorry, I'm not sure I follow. Could you explain that again?","gen","B1"],
["it's up to you","expression","rajtad múlik, te döntesz","you can decide","We can meet online or in person; it's up to you.","gen","A2"],
["hang out","phrasal verb","lóg, együtt van (barátokkal)","to spend free time with friends","We usually hang out by the river on Sundays.","gen","A2"],
["catch up","phrasal verb","beszélget (rég nem látott baráttal); behozza a lemaradást","to talk with someone you haven't seen for a while; to reach the same level","Let's catch up over coffee next week.","gen","B1"],
["work out","phrasal verb","edz; megold, kiderít","to exercise; to find the answer","I work out three times a week.","gen","B1"],
["open-world game","collocation","nyitott világú játék","a video game where players can move freely through a large world","GTA 6 is one of the most anticipated open-world games in years.","gen","B1"],
["storyline","word","történet, cselekmény","the plot of a book, film or game","The storyline was more interesting than the gameplay.","gen","B1",{syn:"plot"}],
["spoiler","word","(cselekményt elárul) spoiler","information that reveals what happens in a story","No spoilers, please! I haven't finished the game.","gen","B1"],
["jet lag","word","időeltolódás okozta fáradtság","tiredness after flying across time zones","I had terrible jet lag after flying to New York.","gen","B1"],
["book a table","collocation","asztalt foglal","to reserve a table in a restaurant","I'd like to book a table for two at seven.","gen","A2"],
["to be fair","expression","az igazsághoz hozzátartozik","used to add a point that is fair to someone","To be fair, the first version was built in two weeks.","gen","B2"],
["I see your point, but","expression","értem, mire gondolsz, de","a polite way to disagree","I see your point, but I think the cost is too high.","gen","B1"],
["in the long run","expression","hosszú távon","over a long period of time","Automated tests save time in the long run.","gen","B2"],
["gain weight","collocation","hízik","to become heavier","I gained weight during the exam period.","gen","B1",{ant:"lose weight"}],
["face a challenge","collocation","kihívással szembesül","to deal with a difficult situation","Every junior developer faces the same challenges.","gen","B2"]
];
const DECK=DECK_RAW.map((d,i)=>({id:"d"+i,w:d[0],cat:d[1],hu:d[2],def:d[3],ex:d[4],track:d[5],lvl:d[6],...(d[7]||{})}));

/* Practice items (quiz + targeted practice). id is stable for mastery tracking. */
const GRAMMAR=[
// articles
{id:"g-ar1",q:"She's ___ engineer at a software company.",o:["a","an","the","—"],a:1,cat:"articles",n:"'an' before a vowel sound.",lvl:"A2"},
{id:"g-ar2",q:"___ internet has changed how we work.",o:["A","An","The","—"],a:2,cat:"articles",n:"'the internet' is unique, so it takes 'the'.",lvl:"B1"},
{id:"g-ar3",q:"He is ___ best developer in our team.",o:["a","—","the","most"],a:2,cat:"articles",n:"Superlatives take 'the'.",lvl:"A2"},
{id:"g-ar4",q:"I usually go to work by ___ bus.",o:["a","the","—","an"],a:2,cat:"articles",n:"'by + transport' takes no article.",lvl:"B1"},
{id:"g-ar5",q:"___ life of a support technician is never boring.",o:["A","The","—","An"],a:1,cat:"articles",n:"'The life of...' is made specific by 'of'.",lvl:"B2"},
{id:"g-ar6",q:"I want to become ___ IT consultant.",o:["a","an","the","—"],a:1,cat:"articles",n:"Jobs take a/an; 'IT' starts with a vowel sound (/aɪ/).",lvl:"A2"},
{id:"g-ar7",q:"___ data security is important for every company.",o:["The","A","—","An"],a:2,cat:"articles",n:"A general, uncountable idea takes no article.",lvl:"B2"},
{id:"g-ar8",q:"Can you close ___ window? It's cold in here.",o:["a","the","—","an"],a:1,cat:"articles",n:"You both know which window: 'the'.",lvl:"A2"},
// prepositions
{id:"g-pr1",q:"I've been working here ___ three years.",o:["since","for","during","from"],a:1,cat:"prepositions",n:"'for' + a length of time; 'since' + a starting point.",lvl:"B1"},
{id:"g-pr2",q:"I'm interested ___ machine learning.",o:["on","about","in","for"],a:2,cat:"prepositions",n:"interested in.",lvl:"B1"},
{id:"g-pr3",q:"It depends ___ the budget.",o:["of","from","on","in"],a:2,cat:"prepositions",n:"depend on (Hungarian 'függ valamitől' tempts you to say 'from').",lvl:"B1"},
{id:"g-pr4",q:"We discussed ___ the new feature.",o:["about","on","—","over"],a:2,cat:"prepositions",n:"'discuss' takes no preposition.",lvl:"B2"},
{id:"g-pr5",q:"The meeting is ___ 3 pm ___ Friday.",o:["at / on","in / at","on / in","at / in"],a:0,cat:"prepositions",n:"at + clock time, on + day.",lvl:"A2"},
{id:"g-pr6",q:"Please reply ___ this email by Friday.",o:["—","on","to","at"],a:2,cat:"prepositions",n:"reply to something.",lvl:"B1"},
{id:"g-pr7",q:"She's good ___ explaining technical things.",o:["in","at","on","with"],a:1,cat:"prepositions",n:"good at something.",lvl:"A2"},
{id:"g-pr8",q:"I'll be there ___ ten minutes.",o:["after","in","during","for"],a:1,cat:"prepositions",n:"'in ten minutes' = ten minutes from now.",lvl:"B1"},
{id:"g-pr9",q:"We arrived ___ Budapest late at night.",o:["to","at","in","on"],a:2,cat:"prepositions",n:"arrive in a city, arrive at a building; never 'arrive to'.",lvl:"B1"},
{id:"g-pr10",q:"The crash was caused ___ a missing config file.",o:["from","by","of","with"],a:1,cat:"prepositions",n:"caused by.",lvl:"B1"},
// present perfect
{id:"g-pp1",q:"I ___ this bug three times this week.",o:["fixed","have fixed","fix","had fixed"],a:1,cat:"present perfect",n:"'this week' is unfinished time: present perfect.",lvl:"B1"},
{id:"g-pp2",q:"___ you ever ___ a presentation in English?",o:["Did / give","Have / given","Have / gave","Do / give"],a:1,cat:"present perfect",n:"Life experience with 'ever': present perfect.",lvl:"B1"},
{id:"g-pp3",q:"I ___ in Szeged since 2021.",o:["live","am living","have lived","lived"],a:2,cat:"present perfect",n:"since + a situation that continues now: present perfect (Hungarian uses present tense here).",lvl:"B1"},
{id:"g-pp4",q:"She ___ just ___ the new version.",o:["has / deployed","did / deploy","is / deploying","have / deployed"],a:0,cat:"present perfect",n:"'just' + a recent result: present perfect.",lvl:"B1"},
{id:"g-pp5",q:"How long ___ you known your team lead?",o:["do","are","have","did"],a:2,cat:"present perfect",n:"How long + a state up to now: present perfect.",lvl:"B1"},
{id:"g-pp6",q:"We ___ the meeting yesterday, so the decision is final.",o:["have had","had","have","had had"],a:1,cat:"present perfect",n:"A finished time ('yesterday') needs past simple, not present perfect.",lvl:"B1"},
// past tenses
{id:"g-pt1",q:"Yesterday I ___ the presentation.",o:["have finished","finished","had finish","finish"],a:1,cat:"past tenses",n:"Finished past time ('yesterday'): past simple.",lvl:"A2"},
{id:"g-pt2",q:"By the time we arrived, the meeting ___.",o:["already started","has already started","had already started","was already start"],a:2,cat:"past tenses",n:"An earlier past action: past perfect.",lvl:"B2"},
{id:"g-pt3",q:"I ___ a report when the power went off.",o:["wrote","was writing","have written","had write"],a:1,cat:"past tenses",n:"Past continuous for an action in progress when something interrupted it.",lvl:"B1"},
{id:"g-pt4",q:"When I was a child, I ___ play video games every evening.",o:["use to","used to","was used to","am used to"],a:1,cat:"past tenses",n:"used to + verb = a past habit.",lvl:"B1"},
{id:"g-pt5",q:"She ___ the email before she realised it had a mistake.",o:["has sent","had sent","sends","was send"],a:1,cat:"past tenses",n:"The first of two past actions: past perfect.",lvl:"B2"},
// question formation
{id:"g-qf1",q:"Where ___ you work?",o:["do","are","does","—"],a:0,cat:"question formation",n:"Present simple questions need 'do'.",lvl:"A2"},
{id:"g-qf2",q:"Can you tell me where ___?",o:["is the server room","the server room is","is server room","the server room"],a:1,cat:"question formation",n:"Indirect questions use statement word order.",lvl:"B2"},
{id:"g-qf3",q:"What ___ when the error appeared?",o:["you did","did you do","you do","have you did"],a:1,cat:"question formation",n:"Past questions: did + subject + base verb.",lvl:"A2"},
{id:"g-qf4",q:"Who ___ the database last night?",o:["did change","changed","did changed","has change"],a:1,cat:"question formation",n:"Subject questions (who did it?) take no 'did'.",lvl:"B2"},
{id:"g-qf5",q:"Do you know what time ___?",o:["does the meeting start","the meeting starts","starts the meeting","is the meeting start"],a:1,cat:"question formation",n:"Indirect question: statement word order, no 'does'.",lvl:"B2"},
{id:"g-qf6",q:"How long ___ it take to restore the backup?",o:["does","is","has","do"],a:0,cat:"question formation",n:"'How long does it take...?'",lvl:"A2"},
// word order
{id:"g-wo1",q:"Which sentence is correct?",o:["I like very much this job.","I like this job very much.","I very much like this job much.","Very much I like this job."],a:1,cat:"word order",n:"Don't put an adverb between the verb and its object.",lvl:"B1"},
{id:"g-wo2",q:"Which sentence is correct?",o:["She always is late.","She is always late.","Always she is late.","She is late always."],a:1,cat:"word order",n:"Frequency adverbs go after 'be' but before main verbs.",lvl:"A2"},
{id:"g-wo3",q:"Which sentence is correct?",o:["Yesterday I have seen him in the office.","I saw him in the office yesterday.","I saw yesterday him in the office.","I in the office saw him yesterday."],a:1,cat:"word order",n:"Subject – verb – object – place – time.",lvl:"B1"},
{id:"g-wo4",q:"Which sentence is correct?",o:["I can't find anywhere my keys.","I can't find my keys anywhere.","Anywhere I can't find my keys.","I can't anywhere find my keys."],a:1,cat:"word order",n:"The object comes right after the verb; place words after it.",lvl:"B1"},
{id:"g-wo5",q:"Hardly ___ the server restarted when it crashed again.",o:["had","has","did","was"],a:0,cat:"word order",n:"'Hardly had ... when ...' (inversion).",lvl:"C1"},
// conditionals
{id:"g-co1",q:"If I ___ more time, I would learn Rust.",o:["have","had","would have","will have"],a:1,cat:"conditionals",n:"Second conditional: if + past, would + verb.",lvl:"B1"},
{id:"g-co2",q:"I wish I ___ more English at school.",o:["studied","had studied","have studied","would study"],a:1,cat:"conditionals",n:"Regret about the past: wish + past perfect.",lvl:"B2"},
{id:"g-co3",q:"If you ___ the cable, the router restarts.",o:["unplug","will unplug","unplugged","would unplug"],a:0,cat:"conditionals",n:"Zero conditional for facts: if + present, present.",lvl:"B1"},
{id:"g-co4",q:"If I ___ you, I'd ask for a pay rise.",o:["am","was","were","be"],a:2,cat:"conditionals",n:"'If I were you' is the standard form for advice.",lvl:"B1"},
{id:"g-co5",q:"If they had backed up the data, they ___ it.",o:["wouldn't lose","won't lose","wouldn't have lost","didn't lose"],a:2,cat:"conditionals",n:"Third conditional: would have + past participle.",lvl:"B2"},
{id:"g-co6",q:"Unless you ___ the update, the bug will stay.",o:["install","will install","don't install","installed"],a:0,cat:"conditionals",n:"unless = if not, followed by the present.",lvl:"B2"},
// passive
{id:"g-pa1",q:"The data ___ every night at 2 am.",o:["backs up","is backed up","is backing","backed up"],a:1,cat:"passive",n:"The data does not do the action: passive.",lvl:"B1"},
{id:"g-pa2",q:"The software ___ for two years before it was replaced.",o:["was used","has been used","is used","uses"],a:0,cat:"passive",n:"A finished past period + passive.",lvl:"B2"},
{id:"g-pa3",q:"The new feature ___ next month.",o:["will release","will be released","is releasing","releases"],a:1,cat:"passive",n:"The feature doesn't release itself: passive.",lvl:"B1"},
{id:"g-pa4",q:"All passwords must ___ every 90 days.",o:["change","be changed","changed","be changing"],a:1,cat:"passive",n:"modal + be + past participle.",lvl:"B2"},
{id:"g-pa5",q:"The report ___ by the manager last week.",o:["wrote","was written","has written","is writing"],a:1,cat:"passive",n:"Past simple passive: was/were + past participle.",lvl:"B1"},
// verb patterns
{id:"g-vp1",q:"I look forward to ___ from you.",o:["hear","hearing","heard","be hearing"],a:1,cat:"verb patterns",n:"'look forward to' + -ing.",lvl:"B1"},
{id:"g-vp2",q:"He made me ___ the whole report again.",o:["to write","writing","write","wrote"],a:2,cat:"verb patterns",n:"make someone + base verb.",lvl:"B2"},
{id:"g-vp3",q:"I'd rather you ___ the code before pushing it.",o:["test","tested","will test","testing"],a:1,cat:"verb patterns",n:"would rather + someone + past simple.",lvl:"C1"},
{id:"g-vp4",q:"I'm not used to ___ up so early.",o:["get","getting","got","be getting"],a:1,cat:"verb patterns",n:"be used to + -ing.",lvl:"B1"},
{id:"g-vp5",q:"She suggested ___ the release until Monday.",o:["to postpone","postponing","postpone","that postponing"],a:1,cat:"verb patterns",n:"suggest + -ing.",lvl:"B2"},
{id:"g-vp6",q:"I'd like ___ about the role.",o:["to know more","knowing more","know more","to knowing more"],a:0,cat:"verb patterns",n:"would like + to-infinitive.",lvl:"A2"},
{id:"g-vp7",q:"Remember ___ the server room door when you leave.",o:["lock","to lock","locking","locked"],a:1,cat:"verb patterns",n:"remember to do = don't forget a future task.",lvl:"B1"},
// countables
{id:"g-cn1",q:"We need ___ information before we decide.",o:["more","many","a few","several"],a:0,cat:"countables",n:"'information' is uncountable.",lvl:"B1"},
{id:"g-cn2",q:"Can you give me some ___ on my CV?",o:["advices","advice","an advice","advise"],a:1,cat:"countables",n:"'advice' is uncountable; 'advise' is the verb.",lvl:"B1"},
{id:"g-cn3",q:"She has ___ experience with cloud platforms.",o:["a lot of","many","a few","much of"],a:0,cat:"countables",n:"'experience' (skill) is uncountable.",lvl:"B1"},
{id:"g-cn4",q:"How ___ equipment do we need for the lab?",o:["many","much","few","a lot"],a:1,cat:"countables",n:"'equipment' is uncountable: how much.",lvl:"B1"},
{id:"g-cn5",q:"There are ___ new features in this release.",o:["much","a few","a little","an"],a:1,cat:"countables",n:"'features' is a countable plural: a few.",lvl:"A2"},
// collocations
{id:"g-cl1",q:"I ___ a mistake in the calculation.",o:["did","made","took","had"],a:1,cat:"collocations",n:"make a mistake.",lvl:"A2"},
{id:"g-cl2",q:"Let's ___ a break.",o:["make","do","take","get"],a:2,cat:"collocations",n:"take a break.",lvl:"A2"},
{id:"g-cl3",q:"She ___ a lot of research before the interview.",o:["made","did","took","gave"],a:1,cat:"collocations",n:"do research.",lvl:"B1"},
{id:"g-cl4",q:"We need to ___ a decision today.",o:["do","make","bring","give"],a:1,cat:"collocations",n:"make a decision (not 'bring', from 'döntést hoz').",lvl:"B1"},
{id:"g-cl5",q:"I hope to ___ experience in IT support this summer.",o:["win","gain","do","catch"],a:1,cat:"collocations",n:"gain experience.",lvl:"B1"},
{id:"g-cl6",q:"We worked all weekend to ___ the deadline.",o:["meet","reach","do","hold"],a:0,cat:"collocations",n:"meet a deadline.",lvl:"B1"},
{id:"g-cl7",q:"Could you ___ a look at this error message?",o:["do","make","have","see"],a:2,cat:"collocations",n:"have (or take) a look at.",lvl:"A2"},
{id:"g-cl8",q:"Please ___ attention to the security warning.",o:["give","make","pay","do"],a:2,cat:"collocations",n:"pay attention.",lvl:"A2"},
// linkers
{id:"g-li1",q:"___ the project was difficult, we enjoyed it.",o:["Despite","Although","However","In spite"],a:1,cat:"linkers",n:"'Although' + clause; 'despite' + noun or -ing.",lvl:"B2"},
{id:"g-li2",q:"The app is popular. ___, it has some security issues.",o:["Although","However","Despite","Whereas"],a:1,cat:"linkers",n:"'However' starts a new sentence, followed by a comma.",lvl:"B1"},
{id:"g-li3",q:"The server was slow. ___, we upgraded the RAM.",o:["Although","Therefore","Despite","Unless"],a:1,cat:"linkers",n:"Therefore = as a result.",lvl:"B1"},
{id:"g-li4",q:"___ the bad weather, the event went ahead.",o:["Although","Despite","However","Even"],a:1,cat:"linkers",n:"despite + noun.",lvl:"B2"},
{id:"g-li5",q:"I'll call you ___ I get the results.",o:["as soon as","since","despite","whereas"],a:0,cat:"linkers",n:"as soon as = immediately when.",lvl:"B1"},
// vocabulary (false friends, word forms)
{id:"g-vo1",q:"We ___ fix the bug tomorrow, but I'm not sure.",o:["eventually","might","finally","actually"],a:1,cat:"vocabulary",n:"'eventually' means 'in the end', not 'esetleg'. Use 'might' or 'possibly'.",lvl:"B1"},
{id:"g-vo2",q:"Can you ___ me your charger for a minute?",o:["borrow","lend","rent","loan to"],a:1,cat:"vocabulary",n:"lend = give for a time; borrow = take for a time.",lvl:"A2"},
{id:"g-vo3",q:"The project was a big ___; we finished early.",o:["success","succeed","successful","successfully"],a:0,cat:"vocabulary",n:"After 'a big' you need a noun.",lvl:"B1"},
{id:"g-vo4",q:"I'm really ___ about the new job.",o:["exciting","excited","excite","excitement"],a:1,cat:"vocabulary",n:"-ed = how you feel; -ing = what causes the feeling.",lvl:"A2"},
{id:"g-vo5",q:"My manager gave me ___ feedback on my report.",o:["actual","useful","eventual","sympathetic"],a:1,cat:"vocabulary",n:"'actual' means 'real' (not 'aktuális'); 'sympathetic' means 'együttérző' (not 'szimpatikus').",lvl:"B2"}
];

/* Assessment sets: two parallel sets so the 4-week re-test uses new items. Grammar: 5 per level. */
const ASSESS_GRAMMAR={
A:[
{q:"She ___ to the gym every Tuesday.",o:["go","goes","going","is go"],a:1,lvl:"A2",cat:"subject-verb agreement"},
{q:"I ___ my keys yesterday.",o:["lose","lost","have lost","losing"],a:1,lvl:"A2",cat:"past tenses"},
{q:"There isn't ___ milk in the fridge.",o:["some","many","any","a"],a:2,lvl:"A2",cat:"countables"},
{q:"This laptop is ___ than my old one.",o:["more fast","fastest","faster","more faster"],a:2,lvl:"A2",cat:"other"},
{q:"We met ___ Monday morning.",o:["in","at","on","by"],a:2,lvl:"A2",cat:"prepositions"},
{q:"I ___ in Szeged since 2021.",o:["live","am living","have lived","lived"],a:2,lvl:"B1",cat:"present perfect"},
{q:"If it rains tomorrow, we ___ at home.",o:["stay","will stay","would stay","stayed"],a:1,lvl:"B1",cat:"conditionals"},
{q:"The report ___ by the manager last week.",o:["wrote","was written","has written","is writing"],a:1,lvl:"B1",cat:"passive"},
{q:"I'm not used to ___ up so early.",o:["get","getting","got","be getting"],a:1,lvl:"B1",cat:"verb patterns"},
{q:"We need to ___ a decision today.",o:["do","make","take on","give"],a:1,lvl:"B1",cat:"collocations"},
{q:"If I ___ about the problem earlier, I would have fixed it.",o:["knew","had known","have known","would know"],a:1,lvl:"B2",cat:"conditionals"},
{q:"By the time we arrived, the meeting ___.",o:["already started","has already started","had already started","was already start"],a:2,lvl:"B2",cat:"past tenses"},
{q:"She suggested ___ the release until Monday.",o:["to postpone","postponing","postpone","that postponing"],a:1,lvl:"B2",cat:"verb patterns"},
{q:"Despite ___ tired, he finished the code.",o:["he was","being","of being","to be"],a:1,lvl:"B2",cat:"linkers"},
{q:"Which request is the most formal?",o:["Can you send me the file?","Send the file, thanks.","Could you possibly send me the file?","Gimme the file pls."],a:2,lvl:"B2",cat:"naturalness & register"},
{q:"Not only ___ the deadline, but they also went over budget.",o:["they missed","did they miss","they did miss","missed they"],a:1,lvl:"C1",cat:"word order"},
{q:"The project, ___ was launched in May, has already made a profit.",o:["that","which","what","who"],a:1,lvl:"C1",cat:"other"},
{q:"Had we tested it properly, the bug ___.",o:["wouldn't have occurred","won't occur","didn't occur","hadn't occurred"],a:0,lvl:"C1",cat:"conditionals"},
{q:"Closest meaning of 'to mitigate a risk':",o:["to ignore it","to reduce it","to create it","to measure it"],a:1,lvl:"C1",cat:"vocabulary"},
{q:"It's high time we ___ a new strategy.",o:["adopt","adopted","will adopt","have adopted"],a:1,lvl:"C1",cat:"verb patterns"}
],
B:[
{q:"My brother ___ in a bank.",o:["work","works","is work","working"],a:1,lvl:"A2",cat:"subject-verb agreement"},
{q:"___ you like coffee?",o:["Are","Do","Does","Is"],a:1,lvl:"A2",cat:"question formation"},
{q:"We didn't ___ to the party last night.",o:["went","go","going","gone"],a:1,lvl:"A2",cat:"past tenses"},
{q:"There ___ two printers in the office.",o:["is","are","be","has"],a:1,lvl:"A2",cat:"subject-verb agreement"},
{q:"The keys are ___ the table.",o:["in","on","at","to"],a:1,lvl:"A2",cat:"prepositions"},
{q:"I ___ for this company for two years now.",o:["work","am working","have been working","worked"],a:2,lvl:"B1",cat:"present perfect"},
{q:"If you heat ice, it ___.",o:["melts","will melted","melted","would melt"],a:0,lvl:"B1",cat:"conditionals"},
{q:"The new office ___ next year.",o:["builds","is building","will be built","will build"],a:2,lvl:"B1",cat:"passive"},
{q:"I'm thinking ___ changing jobs.",o:["to","about","for","on"],a:1,lvl:"B1",cat:"prepositions"},
{q:"She asked me where ___.",o:["did I live","I lived","do I live","lived I"],a:1,lvl:"B1",cat:"question formation"},
{q:"I'd rather ___ from home tomorrow.",o:["work","to work","working","worked"],a:0,lvl:"B2",cat:"verb patterns"},
{q:"He denied ___ the files.",o:["to delete","deleting","delete","that deleting"],a:1,lvl:"B2",cat:"verb patterns"},
{q:"The meeting ___ by the time I logged in.",o:["has finished","had finished","finished already","was finishing"],a:1,lvl:"B2",cat:"past tenses"},
{q:"We should have ___ the risks earlier.",o:["consider","considered","considering","to consider"],a:1,lvl:"B2",cat:"verb patterns"},
{q:"Closest meaning of 'to postpone':",o:["to cancel","to delay","to finish","to approve"],a:1,lvl:"B2",cat:"vocabulary"},
{q:"Only after the audit ___ how serious the problem was.",o:["we realised","did we realise","we did realise","realised we"],a:1,lvl:"C1",cat:"word order"},
{q:"The proposal, ___ I strongly disagreed, was accepted.",o:["that","with which","which","with that"],a:1,lvl:"C1",cat:"other"},
{q:"Were the price lower, more people ___ it.",o:["would buy","will buy","bought","buy"],a:0,lvl:"C1",cat:"conditionals"},
{q:"Closest meaning of 'to scrutinise':",o:["to ignore","to examine carefully","to approve quickly","to publish"],a:1,lvl:"C1",cat:"vocabulary"},
{q:"She is ___ the most experienced person on the team.",o:["by far","very much","so","too"],a:0,lvl:"C1",cat:"collocations"}
]};

const ASSESS_READING={
A:[
{lvl:"A2",title:"A message from Anna",text:"Hi Tom,\nThanks for your email. I can't come to the football match on Saturday because I have to work. My manager asked me to help with a new computer system. But I'm free on Sunday afternoon. Do you want to get a pizza near the station? Let me know!\nAnna",qs:[
{q:"Why can't Anna go on Saturday?",o:["She is ill.","She has to work.","She has no ticket.","She is travelling."],a:1},
{q:"What does Anna suggest?",o:["Watching football on Sunday","Having pizza on Sunday","Meeting at work","Going to the station on Saturday"],a:1},
{q:"What will Anna do at work?",o:["Train new staff","Help with a computer system","Fix a printer","Write emails"],a:1}]},
{lvl:"B1",title:"IT notice: scheduled maintenance",text:"On Thursday from 22:00 to 02:00, the email server will be unavailable while we install security updates. Messages sent during this time will not be lost; they will be delivered once the server is back online. If you need to send urgent messages, please use the team chat instead. Staff working night shifts should save their work before 22:00, as shared drives may also be slow. Thank you for your patience.",qs:[
{q:"Why will the server be unavailable?",o:["It is being replaced.","Security updates are being installed.","There was an attack.","The office is closed."],a:1},
{q:"What happens to emails sent during the maintenance?",o:["They are deleted.","They are returned.","They arrive later.","They move to the team chat."],a:2},
{q:"Who should save their work early?",o:["Managers","People working at night","The IT team","Everyone using chat"],a:1}]},
{lvl:"B2",title:"Remote hiring",text:"Remote work has changed how companies hire. Firms that once recruited only within commuting distance can now employ developers in other countries, which widens the talent pool but also increases competition for each opening. For junior candidates, this is a mixed blessing: there are more openings, yet they compete with experienced people from abroad. Many recruiters say the deciding factor is no longer location but communication: the ability to explain progress clearly in writing and to ask for help early.",qs:[
{q:"What is the main effect of remote work on hiring?",o:["Companies hire fewer people.","The pool of candidates is larger.","Salaries have fallen.","Juniors are preferred."],a:1},
{q:"Why is it 'a mixed blessing' for juniors?",o:["They earn less.","There are more jobs but more competition.","They must move abroad.","Recruiters ignore them."],a:1},
{q:"What do recruiters now value most?",o:["Location","Clear communication","Years of experience","Certificates"],a:1}]},
{lvl:"C1",title:"Technical debt",text:"Few concepts in software are as misunderstood as 'technical debt'. The metaphor is often invoked to excuse sloppy code, yet it was meant to describe something subtler: the deliberate decision to ship with an incomplete understanding of the problem, on the condition that the code is revised once that understanding improves. Debt, in this sense, is not inherently bad; it becomes toxic only when repayment is put off indefinitely and interest accumulates in the form of ever-slower development.",qs:[
{q:"What does the writer suggest about how the term is commonly used?",o:["It is used precisely.","It is often used to justify poor work.","It is rarely used.","It refers only to money."],a:1},
{q:"According to the original idea, technical debt is acceptable when...",o:["the code is never changed.","the team later revises the code.","the product is free.","deadlines are ignored."],a:1},
{q:"What does 'interest' refer to in the last sentence?",o:["Money paid to banks","Developers' curiosity","Development becoming slower","User engagement"],a:2}]}
],
B:[
{lvl:"A2",title:"Notice at the gym",text:"From Monday, the gym opens at 6 am instead of 7 am. The swimming pool is closed for cleaning until Wednesday. Please bring your own towel: we no longer give out towels at reception. Lockers are free, but you need a 100-forint coin.",qs:[
{q:"What changes on Monday?",o:["The gym closes earlier.","The gym opens earlier.","The pool opens.","Towels are free."],a:1},
{q:"Why is the pool closed?",o:["It is broken.","It is being cleaned.","There is no water.","It is too early."],a:1},
{q:"What do you need for a locker?",o:["A towel","A card","A coin","A key from reception"],a:2}]},
{lvl:"B1",title:"A customer email",text:"Hello,\nI bought a wireless keyboard from your online shop two weeks ago. At first it worked perfectly, but since yesterday some keys don't respond, even after I changed the batteries. I have already tried connecting it to a different computer, and the problem is the same. Could you tell me how to return it or get a replacement? I still have the receipt.\nBest regards,\nMárk",qs:[
{q:"What is the problem?",o:["The keyboard never worked.","Some keys stopped working.","The battery is missing.","It was not delivered."],a:1},
{q:"What has Márk already tried?",o:["Calling the shop","Using another computer","Buying a new keyboard","Updating software"],a:1},
{q:"What does he want?",o:["A discount","A return or a replacement","Technical training","New batteries"],a:1}]},
{lvl:"B2",title:"Security training",text:"Cybersecurity training often fails because it focuses on rules rather than habits. Employees are told not to click suspicious links, but phishing emails are designed precisely so that they do not look suspicious. More effective programmes run realistic simulations: staff receive fake phishing emails, and those who click are shown, immediately and without blame, what they missed. Over time, the click rate falls not because people memorise rules but because they develop a reflex to pause before acting.",qs:[
{q:"Why does traditional training often fail?",o:["It is too expensive.","It teaches rules, not habits.","It is too short.","Staff don't attend."],a:1},
{q:"What happens in effective programmes when someone clicks?",o:["They are punished.","They are shown their mistake without blame.","They must repeat the course.","Their manager is told."],a:1},
{q:"What is the main reason the click rate falls?",o:["People memorise rules.","People learn to pause.","Emails are blocked.","Fewer emails are sent."],a:1}]},
{lvl:"C1",title:"Open worlds",text:"The appeal of open-world games lies less in their size than in the illusion of consequence. A sprawling map is merely scenery unless the player's choices ripple outward: a shop owner who remembers a robbery, a district whose atmosphere shifts after a gang war. Developers, however, face a combinatorial problem, since every branching consequence multiplies the content that must be written, tested and translated. Consequently, many studios settle for systems that feel reactive in the moment while quietly resetting behind the scenes.",qs:[
{q:"According to the writer, what makes open-world games appealing?",o:["Their huge maps","The feeling that choices matter","Realistic graphics","Low prices"],a:1},
{q:"Why are real consequences difficult to create?",o:["Players dislike them.","Each consequence multiplies the work.","Game engines can't handle them.","Maps are too big."],a:1},
{q:"What do many studios do instead?",o:["Remove choices","Create effects that seem lasting but reset","Make smaller maps","Hire more writers"],a:1}]}
]};

const ASSESS_WRITING={
A:{task:"Write an email (120–200 words) to your team lead. A customer reported that they cannot log in to your company's web app. Explain what happened, what you have already checked, and what you need from your team lead."},
B:{task:"Write 150–220 words: Should universities teach more practical IT skills and less theory? Give your opinion with reasons and at least one example."}
};
const ASSESS_SPEAKING={
A:["Introduce yourself and your studies. Speak for about one minute.","Describe a technical problem you had and how you solved it.","Do you think AI will make IT support jobs disappear? Why or why not?"],
B:["Talk about a place you would like to travel to, and why.","A colleague cannot connect to the office Wi-Fi. Explain what you would check, step by step.","What makes a good team member? Give examples from your experience."]
};

const CEFR_WRITING="A2: short, simple notes and messages; simple connectors (and, but, because); frequent basic errors. B1: straightforward connected text on familiar topics; links a series of shorter ideas; errors occur but meaning is clear. B2: clear, detailed text; can argue for and against; uses a range of linkers; good grammatical control; errors rarely cause misunderstanding. C1: clear, well-structured text; flexible and effective; complex sentences; wide vocabulary and idiomatic language; consistently high accuracy. C2: smooth, precise, appropriate style; virtually error-free.";
const CEFR_SPEAKING="A2: short phrases and simple sentences about familiar things; needs help; many pauses. B1: connected, simple description and explanation; can keep going comprehensibly though pauses for planning are evident. B2: clear, detailed descriptions; can develop an argument; reasonably fluent; good control with occasional errors. C1: fluent and spontaneous; precise, well-structured, with a broad range of language; errors are rare. C2: effortless, nuanced, precise.";

const PROMPTS=[
{t:"it",lvl:"B1",title:"Email to a lecturer",task:"Write an email to your lecturer asking for a one-week extension for a project. Explain why and suggest a new date. (120-180 words)"},
{t:"it",lvl:"B1",title:"Stand-up update",task:"Write your daily stand-up update: what you did yesterday, what you will do today, and one blocker. (80-120 words)"},
{t:"it",lvl:"B1",title:"Follow-up email after an interview",task:"Write a short follow-up email after a job interview for a junior IT support role. Thank them, mention one thing you discussed, and confirm your interest. (100-150 words)"},
{t:"it",lvl:"B2",title:"Bug report",task:"Write a clear bug report for a web app: steps to reproduce, expected result, actual result, and impact. (150-200 words)"},
{t:"it",lvl:"B2",title:"LinkedIn 'About' section",task:"Write your LinkedIn About section as a Business IT student in Szeged: skills, projects, and the role you are looking for. (150-220 words)"},
{t:"it",lvl:"B2",title:"Tool recommendation",task:"Your manager asks which project management tool the team should use (Jira, Trello or Notion). Write a short recommendation with pros and cons. (180-250 words)"},
{t:"it",lvl:"B2",title:"Explain a database to a client",task:"A small shop owner asks why they need a database instead of Excel. Explain it in simple, professional English. (150-200 words)"},
{t:"it",lvl:"C1",title:"Cover letter",task:"Write a cover letter for a junior business analyst position at an international company in Budapest. (220-300 words)"},
{t:"it",lvl:"C1",title:"Incident summary",task:"Write an incident summary for management: a two-hour outage of the company website. Cover cause, impact, fix, and prevention. (200-280 words)"},
{t:"gen",lvl:"A2",title:"My weekend",task:"Describe your last weekend: where you went, what you did, and who you met. (80-120 words)"},
{t:"gen",lvl:"B1",title:"Szeged for visitors",task:"A foreign friend is visiting Szeged. Write a message recommending three places and explaining why. (120-180 words)"},
{t:"gen",lvl:"B1",title:"A challenge I overcame",task:"Write about a difficult situation you faced and how you dealt with it. (150-200 words)"},
{t:"gen",lvl:"B2",title:"Opinion: remote work",task:"Is working from home better than working in an office? Give your opinion with arguments for both sides. (200-250 words)"},
{t:"gen",lvl:"B2",title:"Game review",task:"Review a game, film or series you played or watched recently. Summarise it without spoilers and say who it is for. (180-240 words)"},
{t:"gen",lvl:"C1",title:"Opinion: AI and jobs",task:"'AI will create more jobs than it destroys.' Discuss, with examples. (250-320 words)"}
];

const SCENARIOS=[
{id:"interview",t:"it",title:"Junior IT Support interview",who:"Hiring manager at an international IT services company",desc:"Classic and behavioural questions, plus a quick troubleshooting question.",start:"Hi, thanks for coming in today. To start, could you tell me a little about yourself and why you're interested in IT support?"},
{id:"explain",t:"it",title:"Explaining a technical issue",who:"Non-technical project manager",desc:"Explain why a feature is delayed by a technical problem, without jargon.",start:"I just heard the release is delayed again. What exactly is the problem, and when will it be fixed?"},
{id:"support",t:"it",title:"Customer troubleshooting call",who:"Frustrated customer whose laptop won't connect to the internet",desc:"Stay calm, ask the right questions, guide them step by step.",start:"Hi, finally! My internet hasn't worked since this morning and I have an important meeting in an hour. Can you help me or not?"},
{id:"standup",t:"it",title:"Daily stand-up",who:"Scrum master",desc:"Give your update, explain a blocker, answer follow-up questions.",start:"Morning everyone. Let's go round. What did you work on yesterday, and what's the plan for today?"},
{id:"present",t:"it",title:"Presenting your software project",who:"Professor at a project defence",desc:"Explain your project and defend your choices.",start:"Welcome. Please give us a short overview of your project, and then we'll have some questions."},
{id:"sql",t:"it",title:"Discussing an SQL database",who:"Senior developer reviewing your database design",desc:"Explain your tables, keys and queries, and respond to criticism.",start:"I've had a quick look at your schema. Walk me through the main tables. Why did you split customers and orders like that?"},
{id:"network",t:"it",title:"Explaining networking concepts",who:"New intern who knows almost nothing about networks",desc:"Explain IP addresses, DNS, routers and firewalls clearly.",start:"Sorry if this is a silly question, but what actually happens when I type a website address into my browser?"},
{id:"followup",t:"it",title:"Agreeing a follow-up email",who:"Client after a meeting",desc:"Summarise the meeting out loud and agree what the follow-up email will say.",start:"Thanks for the meeting. Before we hang up, can you summarise what we agreed and what you'll send me in writing?"},
{id:"client",t:"it",title:"Client requirements call",who:"Owner of a small online shop",desc:"Ask questions to understand what the client wants built.",start:"Hi! So, I want a new website for my shop, but honestly I'm not sure where to start. What do you need to know from me?"},
{id:"smalltalk",t:"gen",title:"Meeting someone new",who:"Friendly Erasmus student from Ireland",desc:"Introduce yourself, ask questions, keep the conversation going.",start:"Hey, I don't think we've met! I'm Aoife. How do you know the host?"},
{id:"food",t:"gen",title:"Ordering food",who:"Waiter in a busy London restaurant",desc:"Order, ask about ingredients, deal with a wrong dish.",start:"Hi there, are you ready to order, or do you need a few more minutes?"},
{id:"travel",t:"gen",title:"Problem at a hotel",who:"Hotel receptionist in Edinburgh",desc:"Your room has a problem. Explain it and ask for a solution politely.",start:"Good evening, how can I help you?"},
{id:"hobbies",t:"gen",title:"Talking about hobbies",who:"New colleague at lunch",desc:"Talk about gaming, sport, films; ask follow-up questions.",start:"So what do you do when you're not studying? Any hobbies?"},
{id:"debate",t:"gen",title:"Friendly debate",who:"Opinionated friend",desc:"Defend your opinion and respond to counter-arguments.",start:"Okay, honest question: do you think video games like GTA are bad for young people? I kind of think they are."}
];
const SPEAK_QS=["Describe your perfect working day in five years.","What is the most useful app on your phone and why?","Explain what Business IT is to a 10-year-old.","Talk about a person who influenced you.","What would you change about your university?","Describe a project you are proud of.","Should university education be free? Why?","Talk about your favourite place in Hungary.","How will AI change your future job?","Describe a time you worked in a team."];
