const fs = require('fs');
const exec = require('child_process').exec;

function eachFiles(filepath, rootPath, callback) {
    if (!rootPath) {
        rootPath = filepath;
    }
    var stat = fs.statSync(filepath);
    if (!stat) {

    } else if (stat.isDirectory()) {
        try {
            var files = fs.readdirSync(filepath);
            if (!files) {

            } else {
                for (var _i in files)(function (i) {
                    var file = files[i];
                    if (filepath.match(/.*\/$/)) {
                        eachFiles(filepath + file, rootPath, callback);
                    } else {
                        eachFiles(filepath + "/" + file, rootPath, callback);
                    }
                }(_i));
            }
        } catch (e1) {
            console.error("Directory " + filepath + " is unreadable.");
        }
    } else if (stat.isFile()) {
        if (callback) {
            callback.call(this, filepath, rootPath);
        }
    } else {
        console.error(filepath + " is not file or directory");
    }
}

eachFiles("./data", null, function(filePath, rootPath) {
    if (filePath.indexOf("_sampled") === -1) {
        var outputFilePath = filePath
            .replace(".wav", "_.wav")
            .replace("_normal/", "_normal/_sampled/")
            .replace("_happy/", "_happy/_sampled/")
            .replace("_angry/", "_angry/_sampled/")
        var command = "sox " + filePath + " " + outputFilePath + " silence 1 0.1 0.1% 1 1.0 0.1% pad 0.2 0.2";
        exec(command, { encoding: 'Shift_JIS' }, (err, stdout, stderr) => {
            if (err) { console.log(err); }
            console.log(stdout);
        });
    }
});