// const fs = require('fs')
//
// const path = './downloads/test.json'
//
// try {
//     fs.unlinkSync(path)
//     console.log("done");
//     //file removed
// } catch(err) {
//     console.error(err)
// }

var temp = "This is a string.";
var count = (temp.match(/ /g) || []).length;
console.log(count);