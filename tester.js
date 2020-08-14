const fs = require('fs')

const path = './downloads/test.json'

try {
    fs.unlinkSync(path)
    console.log("done");
    //file removed
} catch(err) {
    console.error(err)
}