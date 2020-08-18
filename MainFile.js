'use strict'

const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const fs = require('fs')
const mysql = require("mysql");
let data;

const connection = mysql.createConnection({
    host: "localhost",
    user: "AppUser",
    password: "Special888%",
    database: "dtrends"
});

async function grabData() {
    const url = 'https://demo.pygeoapi.io/covid-19/collections/cases/items?f=json&limit=10000'
    const path = Path.resolve(__dirname, 'downloads', 'test.json')
    const writer = Fs.createWriteStream(path)

    //gets the data from the link
    const response = await Axios({
        url,
        method: 'GET'
    })

    //checking the response status of the http request to make sure that all the data was grabbed
    if(Number(response.status) !== 200){
        console.log("error in download attempting to download again")
        for(let i = 0; i < 5; i++){
            let reTry = await Axios({
                url,
                method: 'GET'
            })
            if(Number(reTry.status) === 200){
                data = reTry.data;
                i += 10;
            } else {
                console.log("download retry has failed attempting download retries left: " + i);
            }
        }
    } else {
        data = response.data;
    }
}

function transferFunc(){
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

    connection.connect(err => {
        try {
            let state;
            let displayName;
            let country;
            let Name;
            for (let i = 0; i < data.features.length; i++){
                state = data.features[i].properties.Province_State;
                country = data.features[i].properties.Country_Region;
                //adds underscores to places where there are spaces
                if(country.indexOf(" ") > -1){
                    country = country.replace(/ /g, "_");
                }
                //checks if the data row has a state field then sets the displayName
                if(state == null){
                    Name = coronav + "_" + layerDate + "_" + country;
                    displayName = country;
                } else {
                    //replaces all spaces with underscores
                    if(state.indexOf(" ") > -1){
                        state = state.replace(/ /g, "_")
                    }
                    Name = coronav + "_" + layerDate + "_" + country + "_" + state;
                    displayName = country + "_" + state;
                }
                //insert the data into the table
                let statement = "INSERT INTO covid19 (Date, LayerName, LayerType, Type, DisplayName, CaseNum, ActiveNum, DeathNum, RecovNum, Latitude, Longitude, StateName, CountryName, Color_Confirmed, Color_Death, Color_Recovered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                connection.query(statement, [date, Name, layertype, firstLayer, displayName, data.features[i].properties.Confirmed, data.features[i].properties.Active, data.features[i].properties.Deaths, data.features[i].properties.Recovered, data.features[i].properties.Lat, data.features[i].properties.Long_, state, data.features[i].properties.Country_Region, colorComf, colorDeath, colorRecov], function(err){
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
    });
}

function intervalFunc() {
    //console.log('Cant stop me now!');
    let date = new Date(); // Create a Date object to find out what time it is
    if(date.getHours() === 18 && date.getMinutes() === 10){ // Check the time
        grabData() //grab the data
        setTimeout(transferFunc, 180000); //wait 3 minutes to start to transfer the data over to the sql table
    }
}

setInterval(intervalFunc, 60000);
//every minute check the time

//downloadImage();
//interval2Func();