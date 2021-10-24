require('dotenv').config();
const express = require('express');
const app = express();
var fs = require('fs');
var axios = require('axios');
var csvParser = require('csv-parser');
const path = require('path');
const bodyParser = require('body-parser');
const OktAuth = require('@okta/okta-auth-js');

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


app.get('/',(req, res)=>res.send("Homepage"));
app.get('/login',(req, res)=>res.sendFile(path.join(__dirname,'login.html')));
app.post('/loginhandler',(req,res) => {
    //console.log(req.body);
    const {username, password} = req.body;
    /*
    const username = req.body.username;
    const password = req.body.password;
    */
    //Implement Auth SDK
    const authClient = new OktAuth.OktaAuth({
        issuer: `${process.env.ISSUER}`, //Issuer url of auth server of okta
        url:`${process.env.BASEURL}`, //Okta Org URL: "https://dev-2568829.okta.com"
        clientId:`${process.env.CLIENTID}`, //client id of the app: 0oa27l3tk6YvkXdit5d7
        redirectUri:`${process.env.REDIRECTURI}`, //Redirect uri of the application
        tokenManager: {
            storage: 'sessionStorage'
        }
    });

    //Checking for redirect from Okta
    if(authClient.isLoginRedirect()){
        //Parse the token
        authClient.token.parseFromUrl()
        .then(data => {
            const {idToken} = data.tokens; //const idToken = data.tokens.idToken
            console.log(idToken);
            //Save to token manager
            authClient.tokenManager.add('idToken',idToken)
        })
        .catch(error => console.log(error))
    }else{
        //Retrieve the id token from token manager
        authClient.tokenManager.get('idToken')
        .then(idToken => {
            if(idToken){
                //to claim user is logged in
                res.redirect('http://localhost:3000')
            }else{
                //User is not logged in and we want to force user to login
                authClient.signInWithCredentials({username,password})
                .then(transaction => {
                    if(transaction.status==='SUCCESS'){
                    //     authClient.token.getWithRedirect({
                    //         sessionToken: transaction.sessionToken,
                    //         responseType:'id_token' //implicit
                    //     })
                    //     .then(loginResponse => res.redirect('http://localhost:3000'))
                    //     .catch(error=>console.log(error))
                    authClient.session.setCookieAndRedirect(transaction.sessionToken)
                    }
                })
                .catch()
            }
        })
        .catch(error => console.log(error))
    }
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