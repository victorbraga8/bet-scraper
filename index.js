const pup = require('puppeteer');

const url = "https://www.mercadolivre.com.br/";
const search = 'macbook';

let c = 1;
const list = [];

async function getInfo(){
    const browser = await pup.launch({headless: false});
    const page = await browser.newPage();
    
    await page.goto(url);
    await page.waitForSelector('#cb1-edit');
    
    await page.type("#cb1-edit", search);

    await Promise.all([
        page.waitForNavigation(),
        page.click('.nav-search-btn')
    ])

    // $$eval = busca todos os elementos
    // $eval = busca apenas um elemento
    const links = await page.$$eval('.ui-search-result__image > a', el=> el.map(link => link.href));

    for(const link of links){
        if(c == 10) continue;
        await page.goto(link);
        await page.waitForSelector('.ui-pdp-title');

        const title = await page.$eval('.ui-pdp-title',element=>element.innerText);
        const price = await page.$eval('.andes-money-amount__fraction',element=>element.innerText);

        const seller = await page.evaluate(()=>{
            const el = document.querySelector('.ui-pdp-seller__link-trigger');
            if(el) return el.innerText;            
        });

        const obj = {title,price, seller};
        list.push(obj);
        console.log(obj);

        c++;
    }

    console.log(list);

    await page.waitForTimeout(5000);
    await browser.close();

}

getInfo();
