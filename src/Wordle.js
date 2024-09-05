import { useState, useEffect, useRef } from "react";

export default function Wordle() {
    //#region Variables
    // State to force a re-render whenever the user inputs a letter
    const [, setReRender] = useState(0);

    // Letters to track which row the user is on
    const letters = ["a", "b", "c", "d", "e", "f"];

    // Letter that tracks which row the user is on
    let letter = useRef(letters[0]);

    // Index of the user's letter position of the current row
    let index = useRef(-1);

    // Value of the key input from the user
    let input = useRef("");

    // The word that the user has typed out so far
    let word = useRef("");
    
    // The chosen word for the user to try and guess
    let theWord = useRef("");

    // All the possible 5-letter combinations that are allowed (see words.txt)
    let words = useRef([]);
    //#endregion
    
    // Sleep/delay function
    const timer = ms => new Promise(res => setTimeout(res, ms));

    //#region Async functions
    // Function that is called when the user inputs a 5-letter word that does not exist
    async function errorWord() {
        // Get the element object of the current row
        let element = document.getElementById(`row-${letter.current}`);

        // Loop through each key letter in the row and change the background colour
        for(let c of element.children) {
            c.style.cssText = "background-color: #FB4D3D";
        }

        // Animated shake of the whole row together
        for(let x = 0; x < 6; x++) {
            element.style.cssText = `transition: none; transform: translate(${x % 2 == 0 ? 2.5 : -2.5}px)`;
            await timer(50);
        }

        // Reset the background colour of each letter in the row
        for(let c of element.children) {
            c.style.cssText = "";
        }
        
        // Reset the style of the row element
        element.style.cssText = "";
    }

    // Function that animates the key letter when the user inputs a value
    async function animateKey() {
        // Get the current row's children as an array
        let element = document.getElementById(`row-${letter.current}`).children[index.current];

        // Animated scale growth of the key letter
        for(let x = 0; x < 2; x++) {
            element.style.cssText = `transition: 0.25s transform; transform: scale(${x == 0 ? 1.25 : 1})`;
            await timer(75);
        }

        // Reset the style of the key letter
        element.style.cssText = "";
    }

    // Function that determines the outcome when the user submits a 5-letter word
    async function enterKey () {
        // Get the element object of the current row
        let element = document.getElementById(`row-${letter.current}`);

        // Check whether the user has inputted 5 letters (index.current)
        // And whether the guess is within the 6 rows (when the game is over, this value is set to 'z')
        if(index.current === 4 && letters.indexOf(letter.current) < 6) {
            // Check if the word that the user inputted actually exists
            if(!words.current.includes(word.current)) {
                errorWord();
            } else {
                // Make a temporary variable that we will use to check for duplicate letters
                let tempWord = theWord.current;
                let correct = 0;
                
                for(let i = 0; i < 5; i++) {
                    // Rotate animation
                    element.children[i].classList.add("rotate");

                    // Get class list of the keyboard letter
                    let keyboardLetter = document.getElementById(word.current[i]).classList;
                    if(word.current[i] == theWord.current[i]) { // Check if current letter of user's word is in the right place
                        // Set the background of the key letter to correct (green)
                        element.children[i].classList.add("correct");
                        
                        // Remove the partial style if exists and set the background of the correct keyboard letter
                        keyboardLetter.remove("partial");
                        keyboardLetter.add("correct");
                        
                        correct++;
                    } else if(tempWord.includes(word.current[i])) { // Check whether the temp word contains the current letter of the user's word (allows to check for duplicate letters)
                        // Set the background of the key letter to partially correct (orange)
                        element.children[i].classList.add("partial");
                        
                        // This makes sure that if a keyboard letter is correct, it won't be overwritten with partially correct
                        if(keyboardLetter.length === 1) {
                            keyboardLetter.add("partial");
                        }
                        
                        // Modify the temp word by removing the correct letter
                        tempWord = tempWord.replace(word.current[i], "");
                    } else { // Current letter of user's word is wrong
                        element.children[i].classList.add("incorrect");
                        
                        // Set the background of the incorrect keyboard letter
                        keyboardLetter.add("incorrect");
                        
                    }

                    // Short delay to mimick each letter being revealed in turn
                    await timer(350);
                }
                
                // Reset the user's word guess
                word.current = "";

                // Check if the user has won
                if(correct == 5) {
                    // Set the letter to a value outside of a-f so that they can no longer interact with the game
                    letter.current = "z";

                    // Small delay before animating the key row to show that the user has won
                    await timer(200);
                    element.style.cssText = "transform: scale(1.1)";
                } else {
                    // Increment the letter row
                    letter.current = letters[letters.indexOf(letter.current) + 1];
                }
                
                // Reset the row index
                index.current = -1;
            }
        } else if(index.current < 4 && letters.indexOf(letter.current) < 6) { // Check if the user has pressed enter when they have entered less than 5 letters but still within the game
            for(let x = 0; x < 6; x++) {
                // Animated shake of the whole row together
                element.style.cssText = `transition: none; transform: translate(${x % 2 == 0 ? 2.5 : -2.5}px)`;
                await timer(50);
            }

            // Reset the style of the key letter
            element.style.cssText = "";
        }
        
    }
    //#endregion

    //#region Functions
    // Function to check whether the key input is a letter
    const letterKey = (key) => {
        // Make sure that the user is having a valid go
        if(key.match(/[a-z]/i) && index.current < 4 && letter.current != "z") {
            // Force a re-render of the page
            setReRender(index.current);

            // Add the input to the key, set the current input letter and increment the index
            word.current += key;
            input.current = key;
            index.current++;

            addLetter();
        }
    }

    // Function to change the HTML element to the user's input letter
    const addLetter = () => {
        if(document.getElementById(`${letter.current}${index.current}`) != null) {
            document.getElementById(`${letter.current}${index.current}`).innerHTML = input.current;
            animateKey();
        }
    }

    // Function to delete a key letter (backspace) from a row
    const deleteKey = () => {
        // Make sure that the user is having a valid go
        if(index.current > -1 && letter.current != "z") {
            // Force a re-render of the page
            setReRender(index.current);

            // Remove the last letter in the word variable and set the current input letter to blank
            word.current = word.current.slice(0, index.current);
            input.current = "";

            rmvLetter();
        }
        
    }
    
    // Function to change the HTML element to blank
    const rmvLetter = () => {
        if(document.getElementById(`${letter.current}${index.current}`) != null) {
            document.getElementById(`${letter.current}${index.current}`).innerHTML = input.current;
            index.current--;
        }
    }
    //#endregion
    
    //#region Hooks
    // Hook that is ran at the start of a page reload. Used to initialise variables and listeners
    useEffect(() => {
        // Get the word list
        fetch(require("./words.txt"))
        .then((response) => response.text())
        .then((text) => {
            // Convert the string to an array
            words.current = text.split("\r\n");

            // Choose the random word from the array
            theWord.current = words.current[Math.floor(Math.random() * words.current.length+1)];
        })

        // Function that is called whenever the user presses a key on their keyboard
        const keyPress = (e) => {
            // Exludes characters such as 'Shift', 'Control', 'Space' etc
            if(e.key.length === 1) {
                letterKey(e.key);
            }

            // Check if the user pressed enter
            if(e.key === "Enter") {
                enterKey();
            }
            
            // Check if the user pressed backspace
            if(e.key == "Backspace") {
                deleteKey();
            }
        }

        // Add our function to the keydown event listener
        window.addEventListener("keydown", keyPress);

        // Remove our function from the keydown event listener
        return () => {
            window.removeEventListener("keydown", keyPress);
        };
    }, []);
    //#endregion

    // If you want to cheat and know the word xD
    // console.log(theWord.current);

    //#region HTML (JSX)
    return <>
        <header>
            <h1>
                Wordle by Zeliktric
            </h1>
        </header>
        <div className="main">
            {/* Guess container which has each guess row */}
            <div className="guessContainer">
                <div id="row-a" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="a0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="a1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="a2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="a3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="a4"></h1> 
                    </div>
                </div>

                <div id="row-b" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="b0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="b1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="b2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="b3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="b4"></h1> 
                    </div>
                </div>

                <div id="row-c" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="c0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="c1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="c2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="c3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="c4"></h1> 
                    </div>
                </div>

                <div id="row-d" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="d0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="d1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="d2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="d3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="d4"></h1> 
                    </div>
                </div>

                <div id="row-e" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="e0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="e1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="e2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="e3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="e4"></h1> 
                    </div>
                </div>

                <div id="row-f" className="guessRow">
                    <div className="guessLetter">
                        <h1 id="f0"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="f1"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="f2"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="f3"></h1>
                    </div>
                    <div className="guessLetter">
                        <h1 id="f4"></h1> 
                    </div>
                </div>
            </div>

            {/* Guess keyboard which the user can use instead (also mobile support) */}
            <div className="keyboard">
                <div className="keyRow">
                    <div id="q" className="key" onClick={() => letterKey("q")}>
                        <h3>Q</h3>
                    </div>
                    <div id="w" className="key" onClick={() => letterKey("w")}>
                        <h3>W</h3>
                    </div>
                    <div id="e" className="key" onClick={() => letterKey("e")}>
                        <h3>E</h3>
                    </div>
                    <div id="r" className="key" onClick={() => letterKey("r")}>
                        <h3>R</h3>
                    </div>
                    <div id="t" className="key" onClick={() => letterKey("t")}>
                        <h3>T</h3>
                    </div>
                    <div id="y" className="key" onClick={() => letterKey("y")}>
                        <h3>Y</h3>
                    </div>
                    <div id="u" className="key" onClick={() => letterKey("u")}>
                        <h3>U</h3>
                    </div>
                    <div id="i" className="key" onClick={() => letterKey("i")}>
                        <h3>I</h3>
                    </div>
                    <div id="o" className="key" onClick={() => letterKey("o")}>
                        <h3>O</h3>
                    </div>
                    <div id="p" className="key" onClick={() => letterKey("p")}>
                        <h3>P</h3>
                    </div>
                </div>

                <div className="keyRow">
                    <div id="a" className="key" onClick={() => letterKey("a")}>
                        <h3>A</h3>
                    </div>
                    <div id="s" className="key" onClick={() => letterKey("s")}>
                        <h3>S</h3>
                    </div>
                    <div id="d" className="key" onClick={() => letterKey("d")}>
                        <h3>D</h3>
                    </div>
                    <div id="f" className="key" onClick={() => letterKey("f")}>
                        <h3>F</h3>
                    </div>
                    <div id="g" className="key" onClick={() => letterKey("g")}>
                        <h3>G</h3>
                    </div>
                    <div id="h" className="key" onClick={() => letterKey("h")}>
                        <h3>H</h3>
                    </div>
                    <div id="j" className="key" onClick={() => letterKey("j")}>
                        <h3>J</h3>
                    </div>
                    <div id="k" className="key" onClick={() => letterKey("k")}>
                        <h3>K</h3>
                    </div>
                    <div id="l" className="key" onClick={() => letterKey("l")}>
                        <h3>L</h3>
                    </div>
                </div>

                <div className="keyRow">
                    <div className="key bigKey" onClick={() => enterKey()}>
                        <h4>ENTER</h4>
                    </div>
                    <div id="z" className="key" onClick={() => letterKey("z")}>
                        <h3>Z</h3>
                    </div>
                    <div id="x" className="key" onClick={() => letterKey("x")}>
                        <h3>X</h3>
                    </div>
                    <div id="c" className="key" onClick={() => letterKey("c")}>
                        <h3>C</h3>
                    </div>
                    <div id="v" className="key" onClick={() => letterKey("v")}>
                        <h3>V</h3>
                    </div>
                    <div id="b" className="key" onClick={() => letterKey("b")}>
                        <h3>B</h3>
                    </div>
                    <div id="n" className="key" onClick={() => letterKey("n")}>
                        <h3>N</h3>
                    </div>
                    <div id="m" className="key" onClick={() => letterKey("m")}>
                        <h3>M</h3>
                    </div>
                    <div className="key bigKey" onClick={() => deleteKey()}>
                        <i className="icon fa-solid fa-delete-left"></i>
                    </div>
                </div>
            </div>
        </div>
        
    </>
    //#endregion
}