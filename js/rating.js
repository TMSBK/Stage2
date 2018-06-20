/*
function ratingTracker(radioButton) {
    let radioButtonValue = radioButton.value;
    const ratingSign = document.getElementById('ratingSign');
    ratingSign.textContent = radioButtonValue + " point";

    for (let i=1; i <= 5; i++) {
        let radioElement= document.getElementById(i);
        if (i<=radioButtonValue) {
            radioElement.classList.add('radioInputSpanBackground');
        } else {
            radioElement.classList.remove('radioInputSpanBackground');
        }
    }
    return radioButtonValue;
}
*/