const pup = require('puppeteer');

async function getInfo(){
    const url = "https://fbref.com/pt/comps/9/cronograma/Premier-League-Resultados-e-Calendarios";

    const matchList = [];
    const linksList = [];

    const browser = await pup.launch({headless: false});
    const page = await browser.newPage();
    
    await page.goto(url);

    const tableSelectors = await page.evaluate(()=>{
        const rows = document.querySelectorAll("#sched_2022-2023_9_1 tr");

        return Array.from(rows, row=>{
            const collumns = row.querySelectorAll('td');            
            return Array.from(collumns, collumn => collumn.innerHTML);
        })        
    })

    const link = tableSelectors.map(el => {
        if(el[11]){
            if(el[11].includes('Relatório')){
                const urlBase = 'https://fbref.com/';
                const linkBase = el[11].replace('<a href="',"").replace('">Relatório da Partida</a>', "");
                const linkFinal = urlBase+linkBase;
                linksList.push(linkFinal)                
            }
        }       
    })
    let id = 0;
    for(const links of linksList){       
        // if(id == 1) continue; 
        await page.goto(links);
        await page.waitForSelector('#team_stats_extra');

        // const teamCards = await page.$$eval('.cards > span' , elCard=> elCard.map(teamCard => teamCard));   
        // console.log(teamCards[0]);

        // A formação do yellow card - red card e do yellowRed card esta errada, tanto A quanto B

        const teamACards = await page.$$eval('div > .a > div > .yellow_card', yellowCardsA=> yellowCardsA.map(cardsA => cardsA));
        const teamBCards = await page.$$eval('div > .b > div > .yellow_card', yellowCardsB=> yellowCardsB.map(cardsB => cardsB));

        const teamARedCards = await page.$$eval('div > .a > div > .red_card', yellowCardsA=> yellowCardsA.map(cardsA => cardsA));
        const teamBRedCards = await page.$$eval('div > .b > div > .red_card', yellowCardsB=> yellowCardsB.map(cardsB => cardsB));

        const teamAyellowRedCard = await page.$$eval('div > .a > div > .yellow_red_card', yellowCardsA=> yellowCardsA.map(cardsA => cardsA));
        const teamByellowRedCard = await page.$$eval('div > .b > div > .yellow_red_card', yellowCardsB=> yellowCardsB.map(cardsB => cardsB));
        
        if(teamARedCards && teamAyellowRedCard){
            redCardsTeamA = Number(teamARedCards.length)+Number(teamAyellowRedCard.length);
        }
        if(teamARedCards && !teamAyellowRedCard){
            redCardsTeamA = Number(teamARedCards.length);
        }
        if(!teamARedCards && teamAyellowRedCard){
            redCardsTeamA = Number(teamAyellowRedCard.length);
        }
        if(!teamARedCards && !teamAyellowRedCard){
            redCardsTeamA = Number(0);
        }

        if(teamBRedCards && teamByellowRedCard){
            redCardsTeamB = Number(teamBRedCards.length)+Number(teamByellowRedCard.length);
        }
        if(teamBRedCards && !teamByellowRedCard){
            redCardsTeamB = Number(teamBRedCards.length);
        }
        if(!teamBRedCards && teamByellowRedCard){
            redCardsTeamB = Number(teamByellowRedCard.length);
        }
        if(!teamBRedCards && !teamByellowRedCard){
            redCardsTeamB = Number(0);
        }
        
        const teamStats = await page.$$eval('#team_stats_extra > div ' , el=> el.map(team => team.innerText));   

        const matchStringJoin = [teamStats[0], teamStats[1],teamStats[2]].join('\n');        
        const matchString = matchStringJoin.split("\n");
                
        const match = {
            id: id,
            teamA:{
                name:matchString[0],
                yellowCard: teamACards.length,
                redCard: redCardsTeamA,
                fouls: matchString[3],
                cornerKick: matchString[6],
                crossing:  matchString[9],
                disarm: matchString[15],
                offside: matchString[27],
                goalKick: matchString[30], 
                sideKick: matchString[33],

            },
            teamB:{
                name:matchString[2],      
                yellowCard: teamBCards.length,
                redCard: redCardsTeamB,
                fouls: matchString[5],
                cornerKick: matchString[8],
                crossing:  matchString[11],
                disarm: matchString[17],
                offside: matchString[29],
                goalKick: matchString[32], 
                sideKick: matchString[35],          
            },
        }  
        
        matchList.push(match);
        id ++;                
    }

    await browser.close();

    return matchList;    
}

(async ()=>{
    const temp = await getInfo();   
    console.log(temp);     
})();

// getInfo(); 


