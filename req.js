var request = require('request')
var rand = Math.floor(Math.random()*100000000).toString()
var address = { "address":{"company":"aridEnergy","street":"my street info n5","city":"bbsr","state":"odisha","pin":"752352","country":"india"}};
var userId = '513b272f0eb978703e000008';
var addressId = '513b5408e1b146860c000009';
request({
  method: 'DELETE',
  url: 'http://localhost:8000/api/users/'+userId+'/addresses/'+addressId,
  json: { 'address': address.address } 
}, function (error, response, body) {
  if(response.statusCode == 200){
    console.log(response);
  } else {
    console.log('error: '+ response.statusCode);
    console.log(body);
  }
})

// request('http://localhost:8000/api/txn', function (error, response, body) {
//   console.log(error)
//   console.log(response)
//   console.log(body)
//   if (!error && response.statusCode == 200) {
//     console.log(body) // Print the google web page.
//   }
// })