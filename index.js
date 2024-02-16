import express from "express"
import puppeteer from "puppeteer"
import * as cheerio from 'cheerio';

const app = express()
app.use(express.json({
    limit: "16kb"
}))

const port = 3000

app.post('/', async (req, res) => {

    try {
        const { business, latitude, longitude} = req.body

        

        const browser = await puppeteer.launch()

        console.log(business)
        

        const page = await browser.newPage()

        await page.goto(`https://www.google.com/maps/search/`);


        await page.type('#searchboxinput', `${latitude}, ${longitude}`)

        await page.click("button#searchbox-searchbutton")

        await page.waitForSelector('[data-value="Nearby"]');

        await page.click('[data-value="Nearby"]')

        await page.type('#searchboxinput', `${business}`)

        await page.click("button#searchbox-searchbutton")

        await page.waitForSelector('.e4rVHe.fontBodyMedium');

        for (let i = 0; i < 5; i++) {

            await page.evaluate(() => {
                const element = document.querySelector('div[role="feed"]');
                if (element) {
                    element.scrollTop += element.scrollHeight
                }
            });

        }

        await page.waitForSelector('.e4rVHe.fontBodyMedium');

        const html = await page.evaluate(() => {
            const element = document.querySelector('div[role="feed"]');
            return element ? element.outerHTML : null;
        })

        await browser.close()

        const $ = cheerio.load(html);

        const child = $("a.hfpxzc");

        const parent = []

        child.each((idx, ele) => {
            parent.push($(ele).parent())
        })

        const data = []

        parent.forEach(ele => {
            const url = ele.find("a").attr("href")
            const name = ele.find(".qBF1Pd.fontHeadlineSmall").text()
            const rating = ele.find(".MW4etd").text() || "0"
            data.push({ name, url, rating })
        })

        res.send(data)

    } catch (error) {
        res.status(500).json({ error })
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
