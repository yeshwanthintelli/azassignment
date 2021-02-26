const express = require('express');
const app = express();
const port = 3000;

const config = require('./config');
const azure = require('azure-storage');
const queueService = azure.createQueueService(config.azureStorageAccount, config.azureStorageAccessKey);

const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/push', (request, response) => {
    let message = request.body.email;
    queueService.createQueueIfNotExists(config.queueName, (err, result, res) => {
        if (err) {
            response.status(404).send("Error");
        }
        
        queueService.createMessage(config.queueName, message, (err, result, res) => {
            if (err) {
                response.status(404).send("Error");
            }
            response.status(200).send("Success");
        });
    });
});

app.get('/pop', (req, ores) => {
    let response;
    queueService.getMessages(config.queueName, (err, result, res) => {
        if (!result[0]) { 
            response = "No Messages in the queue"; 
        } else {
            response = result[0].messageText;
            queueService.deleteMessage(config.queueName, result[0].messageId, result[0].popReceipt, (err) => {
                console.log(err);
            });
        }
        ores.send(JSON.stringify(response));
    });
});

app.listen(port, () => console.log(`Listening at port ${port}`));