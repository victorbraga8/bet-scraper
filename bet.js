const pup = require('puppeteer');

const url = "https://fbref.com/pt/comps/9/cronograma/Premier-League-Resultados-e-Calendarios";

let c = 1;
const list = [];
const linksList = [];

async function getInfo(){
    const browser = await pup.launch({headless: true});
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

    for(const links of linksList){        
        await page.goto(links);
        await page.waitForSelector('#team_stats_extra');
        const objList = [];
        const teamStats = await page.$$eval('#team_stats_extra > div ' , el=> el.map(team => team.innerText));   

        const props = Object.keys(teamStats);

        const splitString = teamStats[0].split("\n");
        const teamA = splitString[0];
        const teamB = splitString[2];
        // console.log(split);
        const obj = {teamA,teamB};
        console.log(obj);
        // await page.waitForTimeout(500000);
        
        // await page.waitForSelector('.team_stats_extra');
        
        
        // const teamB = await page.$eval();
    }

    console.log(linksList);

    // await page.waitForTimeout(500000);
    await browser.close();

}

getInfo();
