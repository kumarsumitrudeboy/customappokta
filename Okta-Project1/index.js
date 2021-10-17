require('dotenv').config();
const express = require('express');
const app = express();
var fs = require('fs');
var axios = require('axios');
var csvParser = require('csv-parser');
const path = require('path');

app.get('/',(req, res)=>res.send("Homepage"));
app.get('/login',(req, res)=>res.sendFile(path.join(__dirname,'login.html')));
app.post('/loginhandler',(req,res) => {
    console.log(req.body);
    res.send("Login endpoint")
});
app.get('/logout',(req, res)=>res.send("Logout"));
app.get('/register',(req, res)=>res.sendFile(path.join(__dirname,'register.html')));
app.post('/createuser',(req, res)=>{
    console.log("Received request to create user");
    //Building user profile from registration form input by the user
    let user_data = JSON.stringify({
        "profile": {
            "firstName": users[counter].fname,
            "lastName": users[counter].lname,
            "email": users[counter].email,
            "login": users[counter].login
        },
        "credentials": {
            "password" : { "value": "$t0ngP@$$w0rd" },
            "recovery_question": {
            "question": "Who's a major player in the cowboy scene?",
            "answer": "Annie Oakley"
            }
        } 
    })

    //Defining configuration for Okta CreateUser API call using Axios
    const createUserInOkta = {
        method:'post',
        data:user_data,
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SSWS ${process.env.APIKEY}`
        },
        url: `${process.env.BASEURL}/api/v1/users?activate=false`
    }

    //Calling Okta CreateUSer API using Axios and retrieving response/error
    axios(createUserInOkta)
    .then(response => {
        console.log(JSON.stringify(response.data))
    })
    .catch(error => console.error(error))
});


app.listen(3000, ()=>{
    console.log('Received Request at localhost:3000')
})