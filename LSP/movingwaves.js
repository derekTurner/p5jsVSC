/*
 * @name movingwaves.js
 * @description draw wavefronts to illustrate line array
 * 
*/
var resX = 80; // global variables
var gridX = 0;
var resY = 45; 
var gridY = 0;

var c = 340;  // speed of sound ms-1
var mheight = 30;  // height represented by drawing
var mwidth = mheight * 640/360;   //  width represented by drawing 
var frequency = 64; // Hz
var wavelength = c / frequency;
var lineArray = [];  // array of sources
var maxArray = 10;   // maximum number of sources
var maxSpace = 15;   // max spacing of sources
var maxFreq  = 125;  // Top of Subwoofer range
var minFreq  = 40;   // Bottom of Subwoofer range
var lineSize = 1;    // number of sources in use
var sourceSpacing = 1;// spacing between sources in metres
var sourceCount = 0; // loop counter
var sx = 0;          // current source x
var sy = 0;          // current source y 

var slider1, slider2, slider3; // for control of display
var showControls = true;

function setup() {
  createCanvas(1280, 720); 
  gridX = width/resX;
  gridY = height/resY;
  resX = 640/mwidth;  // pixel per meter
  resY = 320/mheight; // pixel per meter
  background(0xA0, 0xA0, 0xE0);  // hex colors 
  push();
  translate (width/4, height/2); // set origin to centre stage front
  for (sourceCount = 0; sourceCount < maxArray; sourceCount++ ){
    lineArray.push(new Source(0,0,0));
  }
  sx = 0;
  sy = 0.5 * sourceSpacing * (lineSize-1);
  for (sourceCount = 0; sourceCount < maxArray; sourceCount ++){
    lineArray[sourceCount].setPosition(0,sy);
    sy -= sourceSpacing;
  }
  pop();

  slider1 = new Slider(5,39,20,40);
  slider2 = new Slider(5,41,20,42);
  slider3 = new Slider(5,43,20,44);

  slider1.action = function(){
    this.update();
    lineSize = round(map(this.xs,0,255,1,maxArray));
    text("Elements: "+ lineSize,20,15);  // for debugging
    sx = 0;
    sy = 0.5 * sourceSpacing * (lineSize-1);
    for (sourceCount = 0; sourceCount < maxArray; sourceCount ++){
      lineArray[sourceCount].setPosition(0,sy);
    sy -= sourceSpacing;
    }
  };
  slider2.action = function(){this.update();
    sourceSpacing = round(map(this.xs,0,255,1,maxSpace));
    text("Spacing: "+ sourceSpacing,20,15);  // metre
    sx = 0;
    sy = 0.5 * sourceSpacing * (lineSize - 1);
    for (sourceCount = 0; sourceCount < maxArray; sourceCount ++){
      lineArray[sourceCount].setPosition(0,sy);  // sy in meter
    sy -= sourceSpacing;
    }
  };
  slider3.action = function(){this.update();
    frequency = round(map(this.xs,0,255,minFreq,maxFreq));
    text("Frequency: "+ frequency.toFixed(0) + "Hz",20,15);  // metre
    wavelength = c / frequency;
    text("Wavelength: "+ wavelength.toFixed(2)  + "m",20,30);  // metre
  };
}

function draw() {
  background(0xA0, 0xA0, 0xE0);  // hex colors 
  push();
  translate (width/4, height/2); // translate is reset at top of draw loop
  for (sourceCount = 0; sourceCount < lineSize; sourceCount ++){
    lineArray[sourceCount].update();
  }
  pop(); 
 
  for (sourceCount = 0; sourceCount < maxArray; sourceCount ++){
    lineArray[sourceCount].phaseFraction += 0.002;
    lineArray[sourceCount].phaseFraction %= 1;
  }
  
  if (showControls){
    slider1.draw();
    slider2.draw();
    slider3.draw();
  
    if(slider1.isMouseOver()){slider1.action()};
    if(slider2.isMouseOver()){slider2.action()};
    if(slider3.isMouseOver()){slider3.action()};
  }
}  

function  Source(x,y,phase) { // object defined by constructor function
    //properties
    this.xpos = x * resX; // pixel position (x and y in metre)
    this.ypos = y * resY;
    this.phase = phase;   
    this.count = 0;
    this.rings = 15;
    this.phaseFraction = 0;
    // methods
    this.update = function() { // method
        push();
        translate(this.xpos, this.ypos);
        strokeWeight(8);
        point(this.xpos, this.ypos);
        strokeWeight(2);
        ellipseMode(RADIUS);
        noFill();
        for (this.count = 0; this.count < this.rings; this.count ++){         
          stroke(0,0,0,255/(1 + 0.5*(this.count + this.phaseFraction)));
          // empirical formula for visual effect not 1/r2 law
          ellipse(this.xpos, this.ypos, ( wavelength * resX * (this.count + this.phaseFraction)));
        } 
        pop(); 
    } 
    this.setPosition = function(x,y){
      this.xpos = x * resX; // pixel position (x and y in metre)
      this.ypos = y * resY;
    }
    this.setPhase = function(phase){
      this.phase = phase; 
    }
} 

// --------------- slider object code from week 4 -----------//

function Slider(regX,regY,cornerX,cornerY){
    this.regX = regX;
    this.regY = regY;
    this.cornerX = cornerX;
    this.cornerY = cornerY;
 
    this.xs = 0;
    this.x = 0;
    this.y = 0;
    this.cursorX = this.regX * gridX;  // changes when slider updates
    this.cursorY = floor((this.regY*gridY + this.cornerY*gridY)/2); // fixed 
 
 
    this.isMouseOver = function(){
        this.x = constrain(mouseX, this.regX*gridX, this.cornerX*gridX);
        this.y = constrain(mouseY, this.regY*gridY, this.cornerY*gridY);
        return (mouseIsPressed&&(mouseX == this.x)&&(mouseY == this.y));
    }
 
    this.draw = function(){
        push();  
        stroke(10);
        fill(255); 
        rectMode(CORNERS);
        rect(this.regX*gridX, this.regY*gridY,this.cornerX*gridX, this.cornerY*gridY );
        strokeWeight(8);
        point(this.cursorX, this.cursorY);  
        this.xs = map (this.x,  this.regX*gridX, this.cornerX*gridX, 0, 255);
        pop();
    }
 
 
    this.update = function(){
        this.cursorX = this.x; 
        this.xs = map (this.x,  this.regX*gridX, this.cornerX*gridX, 0, 255);
        this.draw();  // redraw if changed
    }
 
    this.action = function(){}; 
    // we will attach an action to the slider after creation
 
    // initialization code to run on creation
    this.draw(); // draws slider initial outline
}

function keyPressed() {
  if(unchar(key)==32){ // toggle controls with space bar
  showControls    = !showControls;  // equivalent code
  }
}
 