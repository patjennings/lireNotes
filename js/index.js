var start = null;
var d;

// Variables exposées
var key = "sol";
var exerciseLength = 80;

var notes = ["a", "b", "c", "d", "e", "f", "g"];
var octaves = [0, 1, 2, 3, 4, 5];
var proposedNote;
var position = 0;
var score = 0;
var lineHeight = 6;
var offset = 104;

var notesToDraw = new Array(); // Le tableau des notes à dessiner

$(document).ready(function () {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    createNotes();
    listenButtons();
    listenKeys();
});

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

function clearActive(t){
    t.removeClass('active');
}

function sendNote(){
    controlInput(proposedNote);

    if(position < notesToDraw.length-1){ // Si ce n'est pas fini

        position++;
        getScore();
    }
    else{ // Si c'est terminé
        console.log("terminé");
        getFinalScore();
    }
    movePositionForward();
}

// Avancer la tête de lecture
function movePositionForward(){
    var newPos = position*52;
    // $(".position").css("left", newPos+"px");
    // $(".portee").css("left", (0-newPos)+"px");

    $(".notes").animate({
        left: (offset+0-newPos)
    },250,function(){
        // something
    });
}

// Contrôler si le résultat entré est le bon
function controlInput(){
    var answerIs;

    if(proposedNote == notesToDraw[position]){
        console.log("Correct");
        answerIs = "correct";
        score++;
    }
    else {
        console.log("Faux, c'est un "+notesToDraw[position]);
        answerIs = "wrong";
    }
    $(".notes").find(".note").eq(position).addClass(answerIs);
}

function setKeyTransparent(){
    $(".notes")
}

// Renvoyer l'évolution du score du joueur
function getScore(){
    result = score*100/position;
    console.log("Evolution : "+result+"% / "+score+" bonnes réponses.");
}

// Renvoyer le score du joueur à la fin
function getFinalScore(){
    result = score*100/exerciseLength;
    console.log(result+"% / "+score+" bonnes réponses.");
    $(".position").css("display", "none");
}
