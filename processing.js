
var model;

async function loadModel() {

    model = await tf.loadGraphModel('TFJS/model.json');

}

function predictImage(){
 

    let image = cv.imread(canvas);
    // Below line converts the image to Black & White.
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 1);

    // Converts any pixel in image above 175 to 255 (white).
    // Converts image to pure Black and White to find the contours.
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    // Find the Contours of the image
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    // Find the bounding Rectangle and Crop the Image
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    image = image.roi(rect); // roi stands for Region of Interest for cropping.

    // Resize the image with height or width (whichever longer) as 20 pixels
    var height = image.rows;
    var width = image.cols;

    if (height > width){
        height = 20;
        const scaleFactor = image.rows/height ;
        width = Math.round(image.cols/scaleFactor) ; 
       } else {
           width=20;
           const scaleFactor = image.cols/width ;
           height = Math.round(image.rows/scaleFactor);
       }
    
       let newSize = new cv.Size(width, height);
       cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

    // Add the padding to make it 28 x 28 pixels
    
    const LEFT = Math.ceil(4 + (20 - width)/2);
    const RIGHT = Math.floor(4 + (20 - width)/2);
    const TOP = Math.ceil(4 + (20 - height)/2);
    const BOTTOM = Math.floor(4 + (20 - height)/2);
    

    const BLACK = new cv.Scalar(0, 0, 0, 0); // for Black Border of the image.
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // Calculating Centre of Mass and Shifting the Image
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);

    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;
  

    // Shifting the Image to the Centre of Mass of the image
    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);

    newSize = new cv.Size(image.cols, image.rows);
    const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);   
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    // Normalize the pixel values of the image.
    let pixelValues = image.data;
    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(function(item){
        return item / 255.0 ;
    });
    //console.log(`ScaledValues : ${pixelValues}`);

    // Create a Tensor & make prediction
    const X = tf.tensor([pixelValues]);
  //  console.log(`Shape of tensor: ${X.shape}`);
    //console.log(`dtype of tensor: ${X.dtype}`);

    const result = model.predict(X);    
    result.print();

    // Capture the value predicted.
    const output = result.dataSync()[0];


    // Clean up
    image.delete();
    contours.delete();
    cnt.delete();
    hierarchy.delete();
    M.delete();   
    X.dispose();
    result.dispose();
  
    return output;

}

