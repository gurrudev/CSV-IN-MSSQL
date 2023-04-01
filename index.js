const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const csvParser = require('csv-parser');
const fs = require('fs');
const sql = require('mssql');
const path = require('path')
const bodyParser = require('body-parser')


const config = {
    user: 'xxxx',
    password: 'xxxx',
    server: 'xxxx', // e.g. 'localhost'
    database: 'xxxx',
    options: {
        encrypt: true, // For secure connection
        trustServerCertificate: true,
    }
};


app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/upload', upload.single('fileToUpload'), function (req, res, next) {
    // parse the CSV file and insert the data into the database
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            sql.connect(config, function (err) {
                if (err) console.log(err);

                const request = new sql.Request();
                let query = '';
                for (let i = 0; i < results.length; i++) {
                    const row = results[i];
                    query += `INSERT INTO HOLIDAY (DATE, DAY, HOLIDAY) VALUES ('${row.Date}', '${row.Day}', '${row.Holiday}')\n`;
                }
                request.query(query, function (err, result) {
                    if (err) console.log(err);
                    console.log(`${results.length} records inserted into database.`);
                    sql.close();
                });
            });
            res.send('CSV file uploaded and records inserted into database successfully!');
        });
});


app.listen(1212, () => console.log('app is running on 1212'));