
let synthControl = null;
let answer;
let isQuestionCreated = false;
let prevNotes = '';

let answerObj;
let nextBtn;


function setAudio(notes, play, hide, clef) {
    function hideNote() {
        const staffNotation = document.querySelector('#score > svg');
        staffNotation.style.display = 'none';
    }

    let abcString = `
    L: 4/4
    K: C${clef == 'G' ? '' : ' bass'}
    ${notes}|
    `;

    // MIDIプレーヤーの準備
    if(synthControl) synthControl.pause();
    synthControl = new ABCJS.synth.SynthController();
    synthControl.load("#play", null, {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
        displayWarp: true
    });
    // 楽譜をレンダリング
    const visualObj = ABCJS.renderAbc('score', abcString);
    if(hide) hideNote();
    
    let width = 15;
    if(!notes) {
        width += 159;
    }else {
        width += notes.split('|').length * 120 + 42;
    }

    document.getElementById('score').style.width = width + 'px';
    document.getElementById('score').style.height = '100px';

    // MIDIの生成
    const midiBuffer = new ABCJS.synth.CreateSynth();
    midiBuffer.init({visualObj: visualObj[0]}).then(function () {
        // console.log("Synth initialized");
        synthControl.setTune(visualObj[0], false, {}).then(function (response) {
            // console.log("Audio loaded");
            if(play) synthControl.play();
        });
    }).catch(function (error) {
        console.error("Error initializing synth", error);
    });
}

function createQuestion() {
    const categoryValue = document.getElementById('category').value;
    const clefValue = document.getElementById('clef').value;
    const hintValue = document.getElementById('hint').value;
    const modeValue = document.getElementById('mode').value;

    let notesDict;

    let category = categoryValue;
    if(category == 'both') {
        category = Math.random() < 0.5 ? 'single' : 'harmony';
    }

    let clef = clefValue;
    if(clef == 'both') {
        clef = Math.random() < 0.5 ? 'G' : 'F';
    }

    if(category == 'single') {
        if(clef == 'G') notesDict = GClefSingleTone;
        else notesDict = FClefSingleTone;
    }else {
        if(clef == 'G') notesDict = GClefHarmonyTone;
        else notesDict = FClefHarmonyTone;
    }

    const play = hintValue != 'sheet-only';
    const hide = hintValue == 'sound-only';

    keys = Object.keys(notesDict);
    do {
        notes = keys[Math.floor(Math.random() * keys.length)];
        if(prevNotes === '') break;
    } while (notes === prevNotes);
    prevNotes = notes;
    answer = notesDict[notes];

    if(modeValue == 'relative') {
        if(clef == 'G') notes = 'C|' + notes;
        else notes = 'C,|' + notes;
    }

    setAudio(notes, play, hide, clef);

    answerObj.innerHTML = '';

    nextBtn.textContent = '答えを見る';

    isQuestionCreated = true;
}

function showAnswer() {
    answerObj.innerHTML = answer;
    document.querySelector('#score > svg').style.display = 'block';

    nextBtn.textContent = '次へ';

    isQuestionCreated = false;
}

function next() {
    if(isQuestionCreated) showAnswer();
    else createQuestion();
}

// 相対音感モードの説明の表示/非表示を切り替える
function setExplanation() {
    const style = document.getElementsByClassName('explanation-relative')[0].style;
    if(document.getElementById('mode').value === 'relative' && document.getElementById('hint').value !== 'sheet-only') {
        style.display = 'block';
    }else {
        style.display = 'none';
    }
}

window.onload = () => {
    answerObj = document.getElementById('answer');
    nextBtn = document.getElementById('next');
    setAudio('', play=false, hide=false, clef='G')

    document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
        document.getElementById('setting').open = false;
    }, false);
    
    document.getElementById('setting').addEventListener('click', (e) => {
        e.stopPropagation();
    }, false);

    document.getElementById('hint').addEventListener('change', (e) => {
        if(document.getElementById('hint').value === 'sheet-only') {
            document.getElementById('mode-select').style.display = 'none';
        }else {
            document.getElementById('mode-select').style.display = 'block';
        }
        setExplanation();
    }, false);

    document.getElementById('mode').addEventListener('change', (e) => {
        setExplanation();
    }, false);
}