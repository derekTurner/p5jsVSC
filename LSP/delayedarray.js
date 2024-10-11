/*
 * @name curvedarray.js
 * @description spherical curved array wavefronts to illustrate line array
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
var lineSize = 5;    // number of sources in use
var sourceSpacing = 1;// spacing between sources in metres
var sourceCount = 0; // loop counter
var sx = 0;          // current source x
var sy = 0;          // current source y 
var angle =  0;      // notional dispersion angle
var arrayradius      // radius of sphere
var maxAngle = 180;  // max angle of curvature 

var slider1, slider2, slider3, slider4; // for control of display
var showControls = true;
var modeCurved = true; // curved (true) or delayed (false) mode

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
  placeSources();
  pop();

  slider1 = new Slider(5,37,20,38);
  slider2 = new Slider(5,39,20,40);
  slider3 = new Slider(5,41,20,42);
  slider4 = new Slider(5,43,20,44);

  slider1.action = function(){
    this.update();
    lineSize = round(map(this.xs,0,255,1,maxArray));
    text("Elements: "+ lineSize,20,15);  // for debugging
    placeSources();
  };
  slider2.action = function(){
    this.update();
    sourceSpacing = round(map(this.xs,0,255,1,maxSpace));
    text("Spacing: "+ sourceSpacing,20,15);  // metre
    placeSources();
  };
  slider3.action = function(){
    this.update();console.log("slider");
    frequency = round(map(this.xs,0,255,minFreq,maxFreq));
    text("Frequency: "+ frequency + "Hz",20,15);  // metre
    wavelength = c / frequency;
    text("Wavelength: "+ wavelength.toFixed(2)  + "m",20,30);  // metre
  };
  slider4.action = function(){
    this.update();
    angle = round(map(this.xs,0,255,0,maxAngle));
    text("Angle: "+ angle + "Degree",20,15);  // degrees
    placeSources();
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
    slider4.draw();
  
    if(slider1.isMouseOver()){slider1.action()};
    if(slider2.isMouseOver()){slider2.action()};
    if(slider3.isMouseOver()){slider3.action()};
    if(slider4.isMouseOver()){slider4.action()};
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
    this.phaseValue = 0;

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
          phaseValue = this.phase + (this.count + this.phaseFraction);
          if (phaseValue >= 0){
            ellipse(this.xpos, this.ypos, ( wavelength * resX * (this.phase + (this.count + this.phaseFraction))));
          }
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

function placeSources(){
    var curveDelay = 0;
    var curvePhase = 0;
    sx = 0;
    sy = 0.5 * sourceSpacing * (lineSize-1);
    arrayradius = (sourceSpacing * lineSize / 2)/sin(max(angle,0.001) * PI/360);
    for (sourceCount = 0; sourceCount < maxArray; sourceCount ++){
      sx = sqrt(arrayradius*arrayradius - sy * sy) - arrayradius;
      if (modeCurved == false){ 
        curveDelay = sx/c;
        curvePhase = (0 + curveDelay * frequency)%1;// 0 - 1
        sx = 0;
        lineArray[sourceCount].setPhase(curvePhase);
      }
      lineArray[sourceCount].setPosition(sx,sy);
      sy -= sourceSpacing;
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
  if(unchar(key)==67){ // c selects curves
    modeCurved = true;  // equivalent code
    placeSources();
  }
  if(unchar(key)==68){ // d selects delays
    modeCurved = false;  // equivalent code
    placeSources();
  }
}
 