var start = null;
var d;

// Variables exposées
var key;
var exerciseLength;

var durees = [5,40,80]; // les trois durées disponibles
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

var notesToDraw = new Array(); // Le tableau des notes à dessiner
var inputDuration = new Array(); // le tableau du temps mis pour répondre
var answersType = new Array(); // le tableau des réponses (correctes/incorrectes)

$(document).ready(function () {
    choseOptions();
    $(".overlay #modal-results").hide();
});

function reset(){
    console.log("reset");
    console.log(notesToDraw);
    $(".overlay #modal-results").hide();
    $(".overlay #modal-choice").show();
    $(".notes").empty().css("left", offset);
    $(".position").show();

    position = 0;
    score = 0;
    notesToDraw = [];
    inputDuration = [];
    answersType = [];
    // choseOptions();
    // console.log(notesToDraw);
}

function killListeners(){
    // kill les écouteurs clavier / souris
    console.log("listeners killed");
    $("body").off("keydown");
    $(".note-btn").each(function(){
        $(this).off("click");
    })
}

function getTime(){
    duration++;
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
	$("body").keydown(function(event) {
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
        clearInterval(interval);
        killListeners();
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

    answersType.push(answerIs); // On pushe l'answer dans le tableau des réponses
    currentNote.addClass(answerIs);
}

// Renvoyer l'évolution du score du joueur
function getScore(){
    result = score*100/position;
    //console.log("Evolution : "+result+"% / "+score+" bonnes réponses.");
}

// Renvoyer le score du joueur à la fin
function getFinalScore(){
    var tt, tc = 0; // temps réponses correctes, temps réponses total
    var totalTime = 0;
    var totalTimeCorrect = 0;
    var totalCorrectAnswers = 0;

    for(var i = 1; i < inputDuration.length; i++){
        totalTime += inputDuration[i];
        if(answersType[i] == "correct"){
            totalTimeCorrect += inputDuration[i];
            totalCorrectAnswers++;
        }
    }
    tt = (totalTime/(inputDuration.length - 1))/10;
    tc = (totalTimeCorrect/(totalCorrectAnswers))/10;
    result = score*100/exerciseLength;

    $(".position").hide();

    console.log("temps de réponse moyen : "+tt+" secondes");
    console.log("temps des réponses correctes : "+tc+" secondes");
    console.log("Pourcentage de bonnes réponses : "+result+"%");
    console.log("Bonnes réponses : "+score);

    displayResultsBox(result, score, tc, tt);
}

function displayResultsBox(s, c, tc, tt){
    // results + cliquer pour cleaner notes + afficher setup;

    $(".overlay").removeClass("hidden");
    $(".overlay #modal-choice").hide();

    $(".overlay #modal-results").show();
    $("#modal-results .score").empty().append(roundWithPrecision(s, 2)+"%");
    $("#modal-results .answers-correct").empty().append(roundWithPrecision(c, 2)+" bonnes réponses");
    $("#modal-results .time-correct").empty().append(roundWithPrecision(tc, 2)+"s. aux bonnes réponses");
    $("#modal-results .time-total").empty().append(roundWithPrecision(tt, 2)+"s. pour toutes les réponses");

    $("#modal-reset").click(function(){
        reset();
    });
}

function roundWithPrecision(number, precision){
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
}
