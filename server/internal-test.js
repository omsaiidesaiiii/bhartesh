const https = require('https');

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/users/workload',
    method: 'GET',
    rejectUnauthorized: false // Allow self-signed certs
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
