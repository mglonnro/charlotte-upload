#!/usr/bin/env node

const request = require("request");
const fs = require("fs");
const path = require("path");
const Hasher = require("./hasher");

if (process.argv.length < 4) {
  console.error("usage: upload.js <boatId> <file>");
  process.exit(1);
}

let boatId = process.argv[2];
let filename = process.argv[3];
console.log("File to upload:", filename);

const FILEDIR = path.dirname(filename);
const FILENAME = path.basename(filename);

var hasher = new Hasher();

hasher
  .getHash(FILEDIR + "/" + FILENAME)
  .then(hash => {
    var r = request.post(
      "http://localhost:3100/boat/" + boatId + "/chunk?hash=" +
        hash +
        "&filename=" +
        FILENAME, (err, res, body) => {
	  console.log("statusCode", res.statusCode);
	  if (res.statusCode != 200) {
	    process.exit(1);
	  } else {
	    process.exit(0);
	  }
	}
    );

    var upload = fs.createReadStream(FILEDIR + "/" + FILENAME, {
      highWaterMark: 65536
    });

    upload.pipe(r);

    var upload_progress = 0;
    upload.on("data", function(chunk) {
      upload_progress += chunk.length;
      //console.log(new Date(), upload_progress);
    });

    upload.on("end", function(res) {
      console.log("Transfer finished");
    });
  })
  .catch(err => {
    console.log("Couldn't calculate hash :/");
    process.exit(1);
  });
