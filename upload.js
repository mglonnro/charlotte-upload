#!/usr/bin/env node

const request = require("request");
const fs = require("fs");
const path = require("path");
const Hasher = require("./hasher");

if (process.argv.length < 3) {
  console.error("usage: upload.js <file>");
  process.exit(1);
}

let filename = process.argv[2];
console.log("File to upload:", filename);

const FILEDIR = path.dirname(filename);
const FILENAME = path.basename(filename);

var hasher = new Hasher();

hasher
  .getHash(FILEDIR + "/" + FILENAME)
  .then(hash => {
    var r = request.post(
      "http://localhost:3100/boat/abc/chunk?hash=" +
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
    // See http://nodejs.org/api/stream.html#stream_new_stream_readable_options
    // for more information about the highWaterMark
    // Basically, this will make the stream emit smaller chunks of data (ie. more precise upload state)
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
