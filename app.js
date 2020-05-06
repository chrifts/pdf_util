var express = require('express');
var app = express();
var formidable = require('formidable');
var env = require('dotenv').config().parsed;
const exec = require('child_process').exec;


function os_func() {
    this.execCommand = function(cmd, callback) {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            callback(stdout);
        });
    }
}
var os = new os_func();

function process(now, filePath, bookname, res) {
    os.execCommand('pdftk '+filePath+' burst output '+__dirname + '/uploads/'+now+'/output_%02d.pdf', function (returnvalue) {
        //ENCRYPT
        os.execCommand('cd '+__dirname+'/uploads/'+now+'; ls | grep -v output_*.*$ | xargs rm', function (countx) {
            os.execCommand('cd '+__dirname+'/uploads/'+now+'; ls | wc -l', function (count) {
                console.log(count)
                var i;
                for (i = 1; i <= count; i++) {
                    i < 10 ? i = '0'+i : i;
                    os.execCommand('cd '+__dirname+'/uploads/'+now+'; qpdf --encrypt ' + env.ENCRYPTER + ' ' + env.ENCRYPTER + ' 40 -- '+__dirname + '/uploads/'+now+'/output_'+i+'.pdf '+__dirname + '/uploads/'+now+'/encrypted_'+i+'.pdf', function (returnvaluexd) {
                    })
                }
               
                os.execCommand('cd '+__dirname+'/uploads/'+now+'; zip -r '+bookname+'.zip ' + 'encrypted_*.pdf', function (returnvalue2) {
                    console.log(returnvalue2);
                    res.sendFile(__dirname+'/uploads/'+now+'/'+bookname+'.zip');
                });
            })
        })
        
    });
}

app.post('/', function (req, res) {
    var now = Date.now();
    var form = new formidable.IncomingForm();
    var route;
    var bookname = 'thebook';
    try {
        form.parse(req, function (err, fields, files) {
            var filepath = files.theFile.path
        });
        form.on('fileBegin', function (name, file){
            os.execCommand('mkdir uploads/'+now, function (ret) {})
            file.path = __dirname + '/uploads/'+now+'/' + file.name.replace(/ /g, '');
            route = file.path;
        });
        form.on('end', () => {
            process(now, route, bookname, res);
        })
    } catch (error) {
        res.send(error)
    }
    
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});