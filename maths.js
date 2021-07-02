var answer;
var score = 0;
var backgroundImages = [];

function nextQuestion() {
    const n1 = Math.floor(Math.random()* 4) ;
    console.log(n1);
    document.getElementById('n1').innerHTML = n1; // gives a value between 0 and 4

    const n2 = Math.floor(Math.random()* 5) ; // gives a value between 0 and 5
    document.getElementById('n2').innerHTML = n2;

    answer = n1 + n2;


}

function checkAnswer() {
    const prediction = predictImage();
    console.log(`answer: ${answer}, prediction: ${prediction}`);

    if (prediction == answer){
        score++;
        console.log(`Correct. Score: ${score}`);
        if (score <=6){
            backgroundImages.push(`url('images/background${score}.svg')`);
            document.body.style.backgroundImage = backgroundImages;
        }
         else {
             alert('Well done.. Start Again ?');
             score =0;
             backgroundImages=[];
             document.body.style.backgroundImage = backgroundImages;

         }   
    }    
    else {
        if (score !=0)
        {score--;}
        console.log(`Wrong. Score: ${score}`);
        alert('Check your maths skills.');
        setTimeout(function(){
            backgroundImages.pop();
            document.body.style.backgroundImage = backgroundImages;
        }, 1000);
    }    
   
   
}