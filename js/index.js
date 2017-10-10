var start = null;
var d;

// Variables exposées
var key;
var exerciseLength;

var durees = [20,40,80]; // les trois durées disponibles
var notes = ["a", "b", "c", "d", "e", "f", "g"];
var notesFr = ["La", "Si", "Do", "Ré", "Mi", "Fa", "Sol"];
var octaves = [0, 1, 2, 3, 4, 5];
var proposedNote;
var position = 0;
var score = 0;
var lineHeight = 6;
var offset = 104;

var interval;

var duration = 0;

var inputDuration = new Array(); // le tableau du temps mis pour répondre
var notesToDraw = new Array(); // Le tableau des notes à dessiner
var correctAnswers = new Array(); // le tableau des réponses (correctes/incorrectes)

$(document).ready(function () {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    // createNotes();
    // listenButtons();
    // listenKeys();
    choseOptions();
});

function reset(){
    // enlever les notes, kill les écouteurs
}

function getTime(){
    duration++;
    console.log(correctAnswers+" / "+inputDuration);
}

function captureTime(){
    inputDuration.push(duration);
    duration = 0;
}

function choseOptions(){
    var k, l;
    $("#modal-validate").click(function(){
        k = $("#choix-clef").val();
        key = k;
        l = $("#choix-duree").val();
        exerciseLength = durees[l];

        createNotes();
        listenButtons();
        listenKeys();

        $(".overlay").addClass("hidden");
    });
}

// créer le tableau de notes
function createNotes(){

    var c = 0; // pour naviguer dans le tableau des notes

    for (var i = 0; i < exerciseLength ; i++){
        c = getFloorRandomArbitrary(0, notes.length);
        notesToDraw.push(notes[c]);
        drawNotes(notesToDraw[i], key);
    }
}

// Dessiner les notes sur la portée
function drawNotes(note, k){
    var n = note;
    var o = 3;

    $(".portee").removeAttr("id").attr("id", "portee-"+key);

    if(k == "sol"){
        o = getFloorRandomArbitrary(2, 6);
    }
    if(k == "fa"){
        o = getFloorRandomArbitrary(0, 3);
    }

    $(".notes").append("<div class='note "+n+" gr"+o+"'></div>")
}

// fonction utilitaire pour renvoyer un nombre aléatoire entre deux valeurs
function getFloorRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
/*
function step(timestamp) {
    console.log(d);
    var progress;
    if (start === null) start = timestamp;
    progress = timestamp - start;
    console.log(progress + "/"+ timestamp+"/"+start);
    //d.css("left", Math.min(progress/10, 200) + "px");
    // d.css("left", 0-(progress/50) + "px");

    if (progress < 100000) {
        requestAnimationFrame(step);
    }
}

requestAnimationFrame(step);
*/

function listenButtons(){
    $(".note-btn").each(function(i){
        $(this).click(function(){
            var classes = $(this).attr('class').split(' ');
            proposedNote = classes[1]; // renvoie le nom de la classe associé au bouton
            setButtonActive();
            sendNote();
        });
    });
}

// Ecouter les touches du clavier
function listenKeys(){
	$("body").keydown(function( event ) {
        event.preventDefault();

		if ( event.keyCode == 65 ) { // touche A
            proposedNote = "c";
		}
        else if ( event.keyCode == 90 ) { // touche Z
            proposedNote = "d";
		}
        else if ( event.keyCode == 69 ) { // touche E
            proposedNote = "e";
		}
        else if ( event.keyCode == 82 ) { // touche R
            proposedNote = "f";
		}
        else if ( event.keyCode == 84 ) { // touche T
            proposedNote = "g";
		}
        else if ( event.keyCode == 89 ) { // touche Y
            proposedNote = "a";
		}
        else if ( event.keyCode == 85 ) { // touche U
            proposedNote = "b";
		}
        else{
            proposedNote = "c"; // Si on est dehors, on rétablit sur Do/C
        }

        setButtonActive();
        sendNote();
	});
}

function setButtonActive(){
    $(".note-btn").each(function(i){
        if($(this).hasClass(proposedNote)){
            $(this).addClass('active');
            var intervalID = setTimeout(() => { clearActive($(this)); }, 500);
        }
    });
}

function convertNotesToFr(noteToConvert){
    for(i = 0; i<notes.length; i++){
        if(noteToConvert == notes[i]){
            return notesFr[i];
        }
    }
}

function clearActive(t){
    t.removeClass('active');
}

function sendNote(){
    if(position == 0){
        interval = setInterval("getTime()", 100);
        inputDuration.push(0); // On démarre le chrono, et la première valeur est zéro (on l'enlèvera du décompte final)
    }
    else{
        captureTime();
    }
    controlInput(proposedNote);

    if(position < notesToDraw.length-1){ // Si ce n'est pas fini
        position++;
        getScore();
    }
    else{ // Si c'est terminé
        console.log("terminé");
        clearInterval(interval);
        getFinalScore();
    }
    movePositionForward();
}

// Avancer la tête de lecture
function movePositionForward(){
    var newPos = position*52;

    $(".notes").animate({
        left: (offset+0-newPos)
    },250,function(){
        // something
    });
}

// Contrôler si le résultat entré est le bon
function controlInput(){
    var answerIs;
    var currentNote = $(".notes").find(".note").eq(position);

    if(proposedNote == notesToDraw[position]){
        // console.log("Correct");
        answerIs = "correct";
        currentNote.append("<div class='correct-note'>check</div>");
        score++;
    }
    else {
        // console.log("Faux, c'est un "+notesToDraw[position]);
        answerIs = "wrong";
        currentNote.append("<div class='correct-note'>"+convertNotesToFr(notesToDraw[position])+"</div>");
    }

    correctAnswers.push(answerIs); // On pushe l'answer dans le tableau des réponses
    currentNote.addClass(answerIs);
}

// Renvoyer l'évolution du score du joueur
function getScore(){
    result = score*100/position;
    console.log("Evolution : "+result+"% / "+score+" bonnes réponses.");
}

// Renvoyer le score du joueur à la fin
function getFinalScore(){
    var tc, tw; // temps réponses correctes, temps réponses incorrectes
    result = score*100/exerciseLength;

    console.log(result+"% / "+score+" bonnes réponses.");
    $(".position").css("display", "none");
}
