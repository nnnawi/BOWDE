var graph_width = 1200;
var graph_height_1 = 400;
var graph_height_2 = 850;

var min_10power = -2;
var rate = 1.4;
var precision = 4;

var x_case_gain = 6;
var y_case_gain = 6;

var bode_graphs = [];

var phase_lower_bound = 0;
var phase_upper_bound = 0;
var gain_upper_bound = 60;

var color_table = [238, 0, 281, 117, 22];
var screenshot_number = 0;

var max_y_timerep = 100;
var min_y_timerep = 0;
var max_x_timerep = 10;

var min_nyquist_x = -1;
var max_nyquist_x = 1;
var min_nyquist_y = -1;
var max_nyquist_y = 1;

var line_stroke_weight = 2;
var text_color;
var line_color;
var background_color;
var box_background_color;

function setup(){
  var canvas_width = windowWidth - 460;
  var canvas_height = windowHeight - 130;
  graph_width = canvas_width - 100;
  graph_height_1 = windowHeight*0.49 - 131.8;
  graph_height_2 = windowHeight - 226.6;
  var canvas = createCanvas(canvas_width,canvas_height);
  canvas.parent('sketch_holder');

  colorMode(HSB,360);

  var first_bode = new bode_graph(1,'1/(1+p)');
  bode_graphs.push(first_bode);
  bode_graphs[0].get_complex_p5();
  bode_graphs[0].get_timevalues_p5();

  background_color = color('hsb(0, 0%, 16%)');
  box_background_color = 120;
  line_color = color('hsb(0, 0%, 38%)');
  text_color = color('hsb(0, 0%, 100%)');

  noLoop();
}

function draw(){
  background(background_color);
  if(document.getElementById('bodetab').checked){
    push();
    translate(70,30);
    draw_bode_responses('gain');
    pop();

    push();
    translate(60,30 + graph_height_1 + 46);
    x_axis_steps_text();
    pop();

    push();
    translate(70,30 + graph_height_1 + 80);
    draw_bode_responses('phase');
    pop();
  }
  else if(document.getElementById('timetab').checked){
    push();
    translate(65,45);
    draw_time_reponses();
    pop();
  }
  else if(document.getElementById('nyqtab').checked){
    push();
    translate(65,45);
    draw_nyquist_responses();
    pop();
  }
}

//Toolbox
function roundup_decimal(input){
  var sign = Math.sign(input);
  input = abs(input);
  var decimal_part = input % 1;
  if(decimal_part >= 0.5){
    return ceil(input)*sign;
  }
  else{
    return floor(input)*sign;
  }
}

function value_magnet(input,magnet_value){
  var magnet_count = roundup_decimal(input/magnet_value);
  return magnet_count * magnet_value;
}

function get_bestMultiple(input,divider,type){
  var sign = Math.sign(input);
  input = abs(input);
  var dividend = +(input/divider).toFixed(1);
  if(type == 'upper'){
    if(sign < 0){
      dividend = Math.floor(dividend);
    }
    else{
      dividend = Math.ceil(dividend);
    }
  }
  else if(type == 'lower'){
    if(sign < 0){
      dividend = Math.ceil(dividend);
    }
    else{
      dividend = Math.floor(dividend);
    }
  }
  return (dividend*divider)*sign;
}

function textPowerOfTen(input_power,x_pos,y_pos){
  textSize(15);
  fill(text_color);
  push()
  translate(x_pos,y_pos);
  text('10',0,0);
  textSize(11);
  text(input_power.toString(),16,-12);
  pop();
}

//Drawing functions
function draw_bode_responses(type){
  if(type == "phase"){

    var min_phase = 10000;
    var max_phase = -10000;

    for(i = 0;i < bode_graphs.length;i++){
      var current_graph = bode_graphs[i];
      if(current_graph.bode_min_phase < min_phase){
        min_phase = current_graph.bode_min_phase;
      }
      if(current_graph.bode_max_phase > max_phase){
        max_phase = current_graph.bode_max_phase;
      }
    }

    min_phase = min_phase*180/3.141592;
    max_phase = max_phase*180/3.141592;

    phase_lower_bound = get_bestMultiple(min_phase,45,"lower");
    phase_upper_bound = get_bestMultiple(max_phase,45,"upper");

    phase_case_number = (phase_upper_bound - phase_lower_bound)/45;

    if(phase_case_number == 0){
      phase_upper_bound += 45;
      phase_lower_bound -= 45;
      phase_case_number = 2;
    }

    draw_loglines(x_case_gain,y_case_gain);

    textAlign(CENTER);
    textSize(15);

    for(y = 0; y <= phase_case_number; y++){
      stroke(line_color);
      strokeWeight(1);

      var pas = graph_height_1*y/phase_case_number;
      var value = phase_upper_bound - 45*y;

      line(0,pas,graph_width,pas);

      noStroke();
      fill(text_color);
      text(value,-35,pas+5);
    }

    for(i = 0;i < bode_graphs.length;i++){
      if(bode_graphs[i].bode_displaybool){
        bode_graphs[i].draw_phase();
      }
    }
  }

  else if(type == "gain"){
    draw_loglines(x_case_gain,y_case_gain);

    textAlign(CENTER);
    textSize(15);
    strokeWeight(2);

    for(y = 0; y <= y_case_gain; y++){
      stroke(line_color);
      pas = graph_height_1*y/y_case_gain;
      line(0,pas,graph_width,pas);

      value = gain_upper_bound - 20*y;
      noStroke();
      fill(text_color);
      text(value,-35,pas+5);
    }

    for(i=0;i < bode_graphs.length;i++){
      if(bode_graphs[i].bode_displaybool){
        bode_graphs[i].draw_gain();
      }
    }
  }
}

function draw_time_reponses(){
  if(document.getElementById("automatic-range-time").checked){
    min_y_timerep = 100000;
    max_y_timerep = -100000;

    for(i = 0;i < bode_graphs.length;i++){
      current_graph = bode_graphs[i];
      if(current_graph.bode_max_timerep > max_y_timerep){
        max_y_timerep = current_graph.bode_max_timerep;
      }
      if(current_graph.bode_min_timerep < min_y_timerep){
        min_y_timerep = current_graph.bode_min_timerep;
      }
    }
  }

  draw_timelines();

  for(i = 0;i < bode_graphs.length;i++){
    if(bode_graphs[i].bode_displaybool){
      bode_graphs[i].draw_timeresponse();
    }
  }
}

function draw_nyquist_responses(){
  if(document.getElementById("automatic-range-nyq").checked){
    min_nyquist_x = 10000;
    max_nyquist_x = -10000;
    min_nyquist_y = 10000;
    max_nyquist_y = -10000;

    for(i = 0;i < bode_graphs.length;i++){
      var current_graph = bode_graphs[i];
      if(current_graph.bode_max_nyquist_x > max_nyquist_x){
        max_nyquist_x = current_graph.bode_max_nyquist_x;
      }
      if(current_graph.bode_min_nyquist_x < min_nyquist_x){
        min_nyquist_x = current_graph.bode_min_nyquist_x;
      }

      if(current_graph.bode_max_nyquist_y > max_nyquist_y){
        max_nyquist_y = current_graph.bode_max_nyquist_y;
      }
      if(current_graph.bode_min_nyquist_y < min_nyquist_y){
        min_nyquist_y = current_graph.bode_min_nyquist_y;
      }
    }
  }

  draw_nyquist_lines();

  for(i = 0;i < bode_graphs.length;i++){
    if(bode_graphs[i].bode_displaybool){
      bode_graphs[i].draw_nyquist_response();
    }
  }
}

function redraw_canvas_gain(input_id){
  if(document.getElementById('bodetab').checked || document.getElementById('nyqtab').checked){
    for(v = 0;v<bode_graphs.length;v++){
      if(bode_graphs[v].bode_id == input_id || input_id == "all"){
        bode_graphs[v].get_complex_p5();
      }
    }
  }
  if(document.getElementById('timetab').checked){
    for(v = 0;v<bode_graphs.length;v++){
      if(bode_graphs[v].bode_id == input_id || input_id == "all"){
        bode_graphs[v].get_timevalues_p5();
      }
    }
  }
  updateGraphInformation();
  redraw();
}

//Update function
function windowResized(){
  resizeCanvas(windowWidth - 460,windowHeight - 130);
  graph_width = windowWidth - 560;
  graph_height_1 = windowHeight*0.49 - 131.8;
  graph_height_2 = windowHeight - 226.6;
  redraw_canvas_gain("all");
}

function mouseMoved(){
  redraw();
  if(document.getElementById('timetab').checked){
    var additional_information_bool = document.getElementById("addition-information").checked;
    if(additional_information_bool){
      var queue = [];
      var output_bool = false;
      if(mouseX > 65 && mouseX < graph_width + 65){
        var linked_x = ceil((mouseX - 65)/precision);
        for(h = 0; h < bode_graphs.length;h++){
          var current_graph = bode_graphs[h];
          var linked_y = current_graph.bode_timerep_array[linked_x];
          var screen_y = map(linked_y,min_y_timerep,max_y_timerep,graph_height_2,0,true) + 45;
          var distance = abs(mouseY - screen_y);
          if(distance < 40){
            output_bool = true;
            queue.push([distance,h,linked_y]);
          }
        }

        var output;
        var distance = 10000;
        for(h = 0;h < queue.length;h++){
          if(queue[h][0] < distance){
            distance = queue[h][0];
            output = queue[h];
          }
        }

        if(output_bool){
          var linked_bode_graph = bode_graphs[output[1]];
          var linked_x = map(mouseX - 65,0,graph_width,0,max_x_timerep,true);
          var screen_y = map(output[2],min_y_timerep,max_y_timerep,graph_height_2,0,true);
          noStroke();
          fill(linked_bode_graph.bode_hue,360,360);
          ellipse(mouseX,screen_y + 45,8,8);
          push();
          translate(mouseX,mouseY);
          fill(box_background_color,200);
          stroke(150);
          rect(0,0,160,90);
          noStroke();
          fill(linked_bode_graph.bode_hue,360,360);
          ellipse(18,18,20,20);
          noStroke();
          fill(text_color);
          textSize(18);
          text("Graph " + linked_bode_graph.bode_id,35,24);
          textSize(15);
          text("Y value: " + output[2].toFixed(3),13,53);
          text("X value: " + linked_x.toFixed(3),13,77);
          pop();
        }
      }
    }
  }
}

function capture_screen(){
  saveCanvas(canvas,"BOWDE_" + screenshot_number.toString(),'png');
  screenshot_number++;
}

//Line functions
function draw_loglines(x_case,y_case,type){
  stroke(line_color);

  sum = (1 - pow(1/rate,9))/(1 - 1/rate);
  step_x = (graph_width/x_case)/sum;

  for(x = 0; x < x_case; x++){
    pas = graph_width*x/x_case;
    for(i = 0; i<=9 ; i++){
      if(i == 0){
        strokeWeight(2);
      }
      else{
        strokeWeight(1);
      }
      line(pas,0,pas,graph_height_1);
      pas += step_x/pow(rate,i);
    }
  }
}

function draw_timelines(){
  var x_step = +(abs(max_x_timerep)/10).toPrecision(1);
  var y_step = +(abs(max_y_timerep - min_y_timerep)/10).toPrecision(1);

  if(document.getElementById("automatic-range-time").checked){
    max_y_timerep = +(get_bestMultiple(max_y_timerep ,y_step,"upper") + y_step).toFixed(2);
  }
  else{
    max_y_timerep = +(get_bestMultiple(max_y_timerep ,y_step,"upper")).toFixed(2);
  }

  min_y_timerep = +(get_bestMultiple(min_y_timerep ,y_step,"lower")).toFixed(2);

  var x_case_number = Math.ceil(max_x_timerep/x_step);
  var y_case_number = Math.ceil(abs(max_y_timerep - min_y_timerep)/y_step);

  var x_tile_length = graph_width/x_case_number;
  var y_tile_length = graph_height_2/y_case_number;

  textAlign(CENTER);

  for(x = 0;x <= x_case_number;x++){
    stroke(line_color);
    strokeWeight(1);
    line(x*x_tile_length,0,x*x_tile_length,graph_height_2);

    var text_value = x_step*x;

    noStroke();
    fill(text_color);
    textSize(15);
    text(text_value.toFixed(2),x*x_tile_length,graph_height_2 + 25);
  }

  for(y = 0;y <= y_case_number;y++){
    stroke(line_color);
    strokeWeight(1);
    line(0,y*y_tile_length,graph_width,y*y_tile_length);

    var text_value = max_y_timerep - y_step*y;

    noStroke();
    fill(text_color);
    textSize(15);
    text(text_value.toFixed(2),-30,y*y_tile_length+5);
  }
}

function draw_nyquist_lines(){
  var x_step = +(abs(max_nyquist_x - min_nyquist_x)/10).toPrecision(1);
  var y_step = +(abs(max_nyquist_y - min_nyquist_y)/10).toPrecision(1) * 2;

  max_nyquist_y = Math.max(abs(max_nyquist_y),abs(min_nyquist_y));

  if(document.getElementById("automatic-range-nyq").checked){
    max_nyquist_y = +(value_magnet(max_nyquist_y,y_step) + y_step).toFixed(2);
    min_nyquist_y = -max_nyquist_y;
    min_nyquist_x = +(value_magnet(min_nyquist_x,x_step) - x_step).toFixed(2);
    max_nyquist_x = +(value_magnet(max_nyquist_x,x_step) + x_step).toFixed(2);
  }
  else{
    max_nyquist_y = +(value_magnet(max_nyquist_y,y_step)).toFixed(2);
    min_nyquist_y = -max_nyquist_y;
    min_nyquist_x = +(value_magnet(min_nyquist_x,x_step)).toFixed(2);
    max_nyquist_x = +(value_magnet(max_nyquist_x,x_step)).toFixed(2);
  }

  var x_case_number = roundup_decimal(abs(max_nyquist_x - min_nyquist_x)/x_step);
  var y_case_number = roundup_decimal(abs(max_nyquist_y - min_nyquist_y)/y_step);

  var x_tile_length = graph_width/x_case_number;
  var y_tile_length = graph_height_2/y_case_number;

  textAlign(CENTER);

  for(x = 0;x <= x_case_number;x++){
    stroke(line_color);
    strokeWeight(1);
    line(x*x_tile_length,0,x*x_tile_length,graph_height_2);
    var text_value = +min_nyquist_x + x*x_step;
    noStroke();
    fill(text_color);
    textSize(15);
    text(text_value.toFixed(2),x*x_tile_length,graph_height_2 + 25);
  }

  for(y = 0;y <= y_case_number;y++){
    stroke(line_color);
    strokeWeight(1);
    line(0,y*y_tile_length,graph_width,y*y_tile_length);
    var text_value = +max_nyquist_y - y*y_step;
    noStroke();
    fill(text_color);
    textSize(15);
    text(text_value.toFixed(2),-30,y*y_tile_length+4);
  }
}

function x_axis_steps_text(){
  var screen_step = graph_width / x_case_gain;
  for(h = 0; h <= x_case_gain; h++){
    textPowerOfTen(min_10power + h,h * screen_step,0);
  }
}

class bode_graph{
  constructor(a,b){
    this.bode_id = a;
    this.bode_formula = b;
    this.bode_complex_array = [];
    this.bode_gain_array = [];
    this.bode_phase_array = [];
    this.bode_timerep_array = [];
    this.bode_max_phase = -10000;
    this.bode_min_phase = 10000;
    this.bode_max_timerep = -10000;
    this.bode_min_timerep = 10000;
    this.bode_hue = color_table[a % color_table.length];
    this.bode_displaybool = true;
    this.bode_min_nyquist_x = 10000;
    this.bode_max_nyquist_x = -10000;
    this.bode_min_nyquist_y = 10000;
    this.bode_max_nyquist_y = -10000;
    this.bode_gain_margin = 0;
    this.bode_phase_margin = 0;
    this.bode_gain_crossover_freq = 0;
    this.bode_phase_crossover_freq = 0;
    this.bode_settling_time = 0;
  }

  get_complex_p5(){
    //Reset Values
    if(replaceLetterByValue(this.bode_formula)){
      this.bode_max_phase = -10000;
      this.bode_min_phase = 10000;
      this.bode_min_nyquist_x = 10000;
      this.bode_max_nyquist_x = -10000;
      this.bode_min_nyquist_y = 10000;
      this.bode_max_nyquist_y = -10000;

      this.bode_phase_array = [];
      this.bode_gain_array = [];
      this.bode_complex_array = [];

      let phase_bias = 0;
      let corrector_bool = true;
      if(document.getElementById('bodetab').checked){
        corrector_bool = document.getElementById("phase_correction_checkbox").checked;
      }

      for(let x=0;x < graph_width;x++){
        let log_pow = map(x,0,graph_width,min_10power,min_10power+x_case_gain);
        let math_x = pow(10,log_pow);

        let bode_value = getComplexValues(math_x);

        if(bode_value.re > this.bode_max_nyquist_x){
          this.bode_max_nyquist_x = bode_value.re;
        }
        if(bode_value.re < this.bode_min_nyquist_x){
          this.bode_min_nyquist_x = bode_value.re;
        }

        if(bode_value.im > this.bode_max_nyquist_y){
          this.bode_max_nyquist_y = bode_value.im;
        }
        if(bode_value.im < this.bode_min_nyquist_y){
          this.bode_min_nyquist_y = bode_value.im;
        }

        this.bode_complex_array.push(bode_value);

        bode_value = bode_value.toPolar();

        let bode_gain = 20*log(bode_value.r)/log(10);
        let bode_phase = bode_value.phi;

        bode_phase += phase_bias;

        if(x > 0 && abs(bode_phase - this.bode_phase_array[x-1]) > 5.23 && corrector_bool){
          let sign = Math.sign(this.bode_phase_array[x-1]);
          phase_bias = sign * 6.28318;
          bode_phase += phase_bias;
        }

        this.bode_gain_array.push(bode_gain);
        this.bode_phase_array.push(bode_phase);

        if(bode_phase > this.bode_max_phase){
          this.bode_max_phase = bode_phase;
        }
        if(bode_phase < this.bode_min_phase){
          this.bode_min_phase = bode_phase;
        }
      }
    }
    let omegaZero = findOmegaZero(this.bode_phase_array);
    let omega180 = findOmega180(this.bode_phase_array);
    this.bode_gain_margin = omega180[0];
    this.bode_phase_margin = omegaZero[0];
    this.bode_gain_crossover_freq = omegaZero[1];
    this.bode_phase_crossover_freq = omega180[1];
  }

  get_timevalues_p5(){
    //Reset Values
    if(replaceLetterByValue(this.bode_formula)){
      this.bode_max_timerep = -100000;
      this.bode_min_timerep = 100000;
      this.bode_timerep_array = []

      for(let x=0;x < graph_width;x+=precision){
        let math_x = map(x,0,graph_width,0,max_x_timerep);
        let math_y;

        if(x != 0){
          math_y = getTimeValues(math_x,this.bode_formula);
        }
        else{
          math_y = getTimeValues(0.00001,this.bode_formula);
        }

        if(math_y > this.bode_max_timerep){
          this.bode_max_timerep = math_y;
        }
        if(math_y < this.bode_min_timerep){
          this.bode_min_timerep = math_y;
        }
        this.bode_timerep_array.push(math_y);
      }
    }
    let fivePercent = fivePercentTimeResponse(this.bode_timerep_array);
    this.bode_settling_time = fivePercent;
  }

  draw_gain(){
    noFill();
    strokeWeight(line_stroke_weight);
    stroke(this.bode_hue,360,360);
    beginShape();
    for(let x=0;x < graph_width; x++){
      let screen_y = map(this.bode_gain_array[x],gain_upper_bound - 20*y_case_gain,gain_upper_bound,graph_height_1,0);
      if(screen_y < graph_height_1 && screen_y > 0){
        vertex(x,screen_y);
      }
    }
    endShape();
  }

  draw_phase(){
    noFill();
    strokeWeight(line_stroke_weight);
    stroke(this.bode_hue,360,360);

    let rad_phase_lower_bound = phase_lower_bound*3.1415926535/180;
    let rad_phase_upper_bound = phase_upper_bound*3.1415926535/180;

    beginShape();
    for(let x=0;x < graph_width; x++){
      let screen_y = map(this.bode_phase_array[x],rad_phase_lower_bound,rad_phase_upper_bound,graph_height_1,0);
      vertex(x,screen_y);
    }
    endShape();
  }

  draw_timeresponse(){
    noFill();
    strokeWeight(line_stroke_weight);
    stroke(this.bode_hue,360,360);
    beginShape();
    for(let x=0;x < this.bode_timerep_array.length;x++){
      let screen_y = map(this.bode_timerep_array[x],min_y_timerep,max_y_timerep,graph_height_2,0,true);
      vertex(x*precision,screen_y);
    }
    endShape();
  }

  draw_nyquist_response(){
    noFill();
    strokeWeight(line_stroke_weight);
    stroke(this.bode_hue,360,360);
    let reversed_conj_complex_array = this.bode_complex_array.map(x => x.conjugate()).reverse();
    let new_complex_array = this.bode_complex_array.concat(reversed_conj_complex_array);
    beginShape();
    for(let x=0;x < new_complex_array.length;x++){
      let current_complex = new_complex_array[x];
      let screen_x = map(current_complex.re,min_nyquist_x,max_nyquist_x,0,graph_width);
      let screen_y = map(current_complex.im,min_nyquist_y,max_nyquist_y,0,graph_height_2);
      vertex(screen_x,screen_y);
    }
    endShape();
  }
}
