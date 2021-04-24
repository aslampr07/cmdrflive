const got = require('got');
const cheerio = require('cheerio');
const http = require('http');
const WebSocket = require('ws');


async function getTotal() {
    try {
        const result = await got("https://donation.cmdrf.kerala.gov.in/index.php/Dashboard/allType_transaction").text()
        const $ = cheerio.load(result);
        const tbody = $('#dashboard > div:nth-child(4) > table > tbody > tr')
        let final = 0;
        tbody.each((i, e) => {
            if (i > 2 && i != 27) {
                const tds = $(e).find("td")
                const amount = $(tds[4]).text()
                final = final + parseInt(amount)
            }
        })
        return final
    } catch (error) {
        console.log("Error", error)
    }
}

const server = http.createServer();
const wss = new WebSocket.Server({ server })

wss.on("connection", (ws, req) => {
    console.log("Client Connected")
    console.log("Total connections:", wss.clients.size)
})


server.listen(8000, () => {
    console.log("Server is listerning")
})

setInterval(async () => {
    const result = await getTotal()
    broadCastData(JSON.stringify({ todayTotal: result }))
    console.log("Total connections:", wss.clients.size)
}, 6000);


function broadCastData(data) {
    wss.clients.forEach(client => {
        client.send(data)
    })
}
