//define globals
var ident = "not identified";
var face_id = "not identified";

window.addEventListener('load', function() {
    //define human_ident
    //load face-recognition models and stored faces
    async function loadModels() {
        await  faceapi.loadFaceRecognitionModel("/weights");
        await faceapi.loadMtcnnModel("/weights");
        console.log("face-rec/det models are loaded");
    };
    async function detectFaces(){
        // defaults parameters shown:
        const forwardParams = {
            // number of scaled versions of the input image passed through the CNN
            // of the first stage, lower numbers will result in lower inference time,
            // but will also be less accurate
            maxNumScales: 30,
            // scale factor used to calculate the scale steps of the image
            // pyramid used in stage 1
            scaleFactor: 0.709,
            // the score threshold values used to filter the bounding
            // boxes of stage 1, 2 and 3
            scoreThresholds: [0.6, 0.7, 0.7],
            // minimum face size to expect, the higher the faster processing will be,
            // but smaller faces won't be detected
            minFaceSize: 20
        };

        const results = await faceapi.mtcnn(document.getElementById('thevideo'), forwardParams);

        //get face values as results
        const minConfidence = 0.8
        if (results) {
            results.forEach(({ faceDetection, faceLandmarks }) => {
                console.log("facedet_score:", faceDetection.score);
                // ignore results with low confidence score
                if (faceDetection.score < minConfidence) {
                    console.log('not a face');
                    //return;
                };
                console.log('we got a face');
                ident = "human elements detected";
                console.log("face landmarks: ", faceLandmarks);
                console.log("faceDetection: ", faceDetection);
                // faceapi.drawDetection('overlay', faceDetection);
                // faceapi.drawLandmarks('overlay', faceLandmarks);
                // return ident;
            });
        };
    };

    //do a face check, connect to chat
    async function faceCheck() {
        //detect face in webcam-stream
        await loadModels();
        await detectFaces();
        console.log("ident: ", ident)
        if (ident == "human elements detected") {
            connectToChat();
        };
        if (ident == "not identified") {
            console.log("the thing:", ident)
            document.getElementById('human_ident').innerHTML = "<span style=\"color:black\">" + "updated scan status:"
            + "</span>" + "<span style=\"color:red\">" + ident + "</span>" + "<br /><br />";
        };
        // try to recognize face in webcam-stream
        const descriptor1 = await faceapi.computeFaceDescriptor(document.getElementById('theface'))
        const descriptor2 = await faceapi.computeFaceDescriptor(document.getElementById('thevideo'))
        const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
        console.log(distance);
        if (distance < 0.6) {
            console.log('match');
            face_id = "known";
        }
        else {
          console.log('no match');
          face_id = "unknown";
        };
    };

    // The video element on the page to display the webcam
    var video = document.getElementById('thevideo');
    //declare the storedFace as image
    var storedFace = document.getElementById('theface');
    storedFace.src = 'roland1.png';
    var storedFace2 = document.getElementById('theface2');
    storedFace2.src = 'penny5.png';
    console.log("storedFaces are loaded");
    // Constraints - what do we want?
    let constraints = { audio: false, video: true };

    // Prompt the user for permission, get the stream
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        /* Use the stream */

        // Attach to our video object
        video.srcObject = stream;

        // Wait for the stream to load enough to play
        video.onloadedmetadata = function(e) {
            video.play();
            document.getElementById("thevideo").style.display = "none";
            draw();
            document.getElementById("thecanvas").style.display = "none";
            document.getElementById("theimage").style.display = "none";
            document.getElementById("theface").style.display = "none";
            document.getElementById("theface2").style.display = "none";
            faceCheck();
        };
    })
    .catch(function(err) {
        /* Handle the error */
        alert(err);
    });

    // Canvas element on the page
    var thecanvas = document.getElementById('thecanvas');
    thecanvas.height="480";
    thecanvas.width="720";
    console.log(thecanvas);
    var thecontext = thecanvas.getContext('2d');
    console.log(thecontext);
    console.log(video);
    var draw = function() {
        // Draw the video onto the canvas
        thecontext.drawImage(video,0,0, video.width="480", video.height="720");
        console.log("video size: %x% ", video.width, video.height);
        // var dataUrl = thecanvas.toDataURL();
        // socket.emit('dataurl',dataUrl);
        // // Draw again in 3 seconds
        setTimeout(draw,500);
    };
    // connect to chat only when face check was successful
    var connectToChat = function() {
        var dataUrl = thecanvas.toDataURL();
        socket.emit('dataurl',dataUrl);
        // Draw again in 3 seconds
        setTimeout(connectToChat,500);
    };
});

var socket = io.connect();
console.log("face_id top:", face_id);
socket.on('connect', function() {
    console.log("Connected");
    if (ident) {document.getElementById('human_ident').innerHTML = "<span style=\"color:black\">" + "Scanning your visual interfaces"
    + "</span>" + "<br /><br />" + "* please take off any protective devices for machine identification." + "<br /><br />"
    + "current scan status: " + "<span style=\"color:red\">" + ident + "</span>" + "<br /><br />";}
});

// get base64-data, show it
socket.on('dataurl', function(data) {
    //create a test image to check socket connection (hidden by default, uncheck if needed)
    var theimage = document.getElementById('theimage');
    theimage.src = data.data;

    //convert base64-data to binary, tester ...
    // var BASE64_MARKER = ';base64,';
    // function binaryData(b64) {
    //   var base64Index = b64.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    //   var base64 = b64.substring(base64Index);
    //   var raw = window.atob(base64);
    //   var rawLength = raw.length;
    //   var array = new Uint8Array(new ArrayBuffer(rawLength));
    //
    //   for(i = 0; i < rawLength; i++) {
    //     array[i] = raw.charCodeAt(i);
    //   }
    //   return array;
    // };
    // var binary_data = binaryData(data.data);
    //console.log(binary_data);

    // display face-check status

    //get Base64 image data and user id of it
    // function waitForFaceId() {
    //     ident = "face checked already";
    //     document.getElementById('human_ident').innerHTML = "updated scan status: human elements detected, connecting to human_machine chat";
    //     //setTimeout(showTopIntro, 4000);
    //     console.log("ident_low:", ident);
    //     //console.log("face_id: ", face_id);
    //     // if (face_id == "known"){
    //     //document.getElementById('human_ident').innerHTML = "yes"
    //         //"updated scan status: human elements detected, welcome back, Roland!"
    //                 //+ "<br />" +  "connecting now to human_machine chat";
    //     // }
    //     // else {
    //     //     document.getElementById('human_ident').innerHTML = "updated scan status: unknown human elements detected, connecting now to human_machine chat";
    //     // };
    //     // setTimeout(function(){showTopIntro()}, 4000);
    //     // ident = "face_checked already";
    // };

    if (ident == "human elements detected") {
        document.getElementById('human_ident').innerHTML = "updated scan status: human elements detected, connecting to human_machine chat";
        setTimeout(showTopIntro(), 4000);
        ident = "face_checked already"
    }
    if (ident == "face_checked already") {
        showTopIntro();
    }

    function showTopIntro(){
        if (face_id == "known") {
            document.getElementById('face_id').innerHTML = "Welcome back, Roland!";
        };
        document.getElementById('human_ident').innerHTML = "In another reality I am half human, half machine."
            + "<br />" + "I can read Base64 and see you, "
            + "<span style=\"color:red\">" +
            data.id + "</span>" + ".";
        showBase64();
    }
    function showBase64() {
        document.getElementById('image_data').innerHTML = "<br /><br />" + "<span style=\"font-size:4\">" + data.data + "</span>";
        document.getElementById("thevideo").style.display = "none";
        //document.getElementById("human_ident").style.display = "none";
    }
});
