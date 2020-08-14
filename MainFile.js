'use strict'

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const fs = require('fs')
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "AppUser",
    password: "Special888%",
    database: "automation"
});

async function downloadImage() {
    const url = 'https://demo.pygeoapi.io/covid-19/collections/cases/items?f=json&limit=10000'
    const path = Path.resolve(__dirname, 'downloads', 'test.json')
    const writer = Fs.createWriteStream(path)

    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
    console.log("new file")
}

function interval2Func(){
    console.log("starting transfer");
    const coronav = "coronav"
    const layertype = 'H_PKLayer';
    const firstLayer = 'Corona_Virus';
    const colorComf = 'rgb(220,0,0) rgb(220,0,0) rgb(220,0,0)';
    const colorDeath = 'rgb(0,0,0) rgb(0,0,0) rgb(0,0,0)';
    const colorRecov = 'rgb(124,252,0) rgb(124,252,0) rgb(124,252,0)';
    let today = new Date();
    let day = today.getMonth() + 1;
    let formattedMonth = ("0" + day).slice(-2);
    let formattedDay = ("0" + today.getDate()).slice(-2);
    let date = today.getFullYear() + "-" + formattedMonth + "-" + formattedDay;
    let layerDate = formattedMonth + formattedDay + today.getFullYear();
    const deletePath = './downloads/test.json'
    console.log(date);

    connection.connect(err => {
        fs.readFile('./downloads/test.json', 'utf8', (err, jsonArray) => {
            if (err) {
                console.log("Error reading file from disk:", err)
                return
            }
            try {
                const tableData = JSON.parse(jsonArray)
                //console.log("Customer address is:", tableData.features[15].properties) // => "Customer address is: Infinity Loop Drive"
                //console.log(tableData.features[743]);
                //console.log(tableData.features[0])
                let state;
                let displayName;
                let country;
                let Name;
                for (let i = 0; i < 744; i++){
                    state = tableData.features[i].properties.Province_State;
                    country = tableData.features[i].properties.Country_Region;
                    if(country.indexOf(" ") > -1){
                        country = country.replace(" ", "_");
                    }
                    if(state == null){
                        Name = coronav + "_" + layerDate + "_" + country;
                        displayName = country;
                    } else {
                        if(state.indexOf(" ") > -1){
                            state = state.replace(" ", "_")
                        }
                        Name = coronav + "_" + layerDate + "_" + country + "_" + state;
                        displayName = country + "_" + state;
                    }
                    //console.log(Name);
                    let statement = "INSERT INTO layerdup (Date, LayerName, LayerType, Type, DisplayName, CaseNum, ActiveNum, DeathNum, RecovNum, Latitude, Longitude, StateName, CountryName, Color_Confirmed, Color_Death, Color_Recovered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    connection.query(statement, [date, Name, layertype, firstLayer, displayName, tableData.features[i].properties.Confirmed, tableData.features[i].properties.Active, tableData.features[i].properties.Deaths, tableData.features[i].properties.Recovered, tableData.features[i].properties.Lat, tableData.features[i].properties.Long_, state, tableData.features[i].properties.Country_Region, colorComf, colorDeath, colorRecov], function(err){
                        if (err){
                            throw err;
                        } else {
                            //console.log(i)
                        }
                    })
                }
            } catch(err) {
                console.log('Error parsing JSON string:', err)
            }
        })
        try {
            fs.unlinkSync(deletePath);
            console.log("done");
            //file removed
        } catch(err) {
            console.error(err)
        }
    });
}

function intervalFunc() {
    console.log('Cant stop me now!');
    let date = new Date(); // Create a Date object to find out what time it is
    if(date.getHours() === 16 && date.getMinutes() === 4){ // Check the time
        downloadImage()
        console.log("download complete!");
        setTimeout(interval2Func, 300000);
    }
}

setInterval(intervalFunc, 60000);
//every minute check the time