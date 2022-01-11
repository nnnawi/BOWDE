if (document.readyState == 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else {
  ready();
}

function ready(){
  var add_button = document.getElementsByClassName("add-graph")[0];
  add_button.addEventListener('click',addNewGraph);
  var setting_button = document.getElementsByClassName("option-button")[0];
  setting_button.addEventListener('click',toolboxMenuToogle);
  createFirstGraph();
  var input_equation = document.getElementsByClassName("input-equation")[0].getElementsByClassName("formula")[0];
  input_equation.addEventListener('input',updateInputFormula);
  updateToolbox();
}

var id_bank = 1;
var current_info_tab_id = 1;
var current_tab = 0;

function getGraphById(input_id){
  for(i = 0;i < bode_graphs.length;i++){
    var current_graph = bode_graphs[i];
    if(current_graph.bode_id == input_id){
      return current_graph;
    }
  }
  return "none";
}

function updateInputFormula(event){
  input_formula = event.target.getValue('ascii-math');
  redraw_canvas_gain("all");
}

function checkSlider(input_id){
  var linked_formula = getGraphById(input_id).bode_formula;
  for(i=0;i<range_slider_alphabet.length;i++){
    var current_letter = range_slider_alphabet[i];
    var linked_button = document.getElementById("BTNS_" + input_id.toString() + "_" + i.toString());
    if(linked_formula.includes(current_letter)){
      if(range_slider_variables[i] == 18012001 && linked_button == null){
        createSliderButton(input_id,i);
      }
    }
    else if(linked_button != null){
      linked_button.remove();
    }
  }
}

function createSliderButton(equation_id,letter_id){
  var slider_button = document.createElement("button");
  slider_button.classList.add("slider-button")
  slider_button.innerHTML = range_slider_alphabet[letter_id];
  slider_button.id = "BTNS_" + equation_id.toString() + "_" + letter_id.toString();
  slider_button.setAttribute("style","margin: 0 0 5px 10px");
  slider_button.addEventListener('click',createRangeSlider);

  var button_wrapper = document.getElementById(equation_id).parentElement.parentElement.getElementsByClassName("slider-buttons")[0];
  button_wrapper.append(slider_button);
}

function createRangeSlider(event){
  var slider = document.createElement('div');
  var button = event.target;
  var button_id = button.id.split("_")[2];

  slider.classList.add("slider-wrapper");
  slider.innerHTML =
  `
    <div class="slider-subwrapper">
      <div class="value-wrapper">
        <span style="margin:0">a =</span>
        <input type="text" value="">
      </div>
      <div class="slider">
        <input type="text" value="1.0" class="slider-bound">
        <input type="range" min="1" max="200" step="0.01" class="range-slider" id=${"RANGE_" + button_id} value="20" style="width:100%">
        <input type="text" value="200" class="slider-bound">
      </div>
      <button type="button" class="delete-graph"><i class="material-icons" style="font-size: 38px; color: #b0b0b0">clear</i></button>
    </div>
    <hr>
  `
  var delete_button = slider.getElementsByClassName("delete-graph")[0];
  delete_button.addEventListener('click',removeSlider);

  slider.getElementsByTagName("span")[0].innerHTML = range_slider_alphabet[button_id] + "=";

  var linked_letter = range_slider_alphabet[button_id];
  var range_slider = slider.getElementsByClassName("range-slider")[0];
  var linked_span = slider.getElementsByClassName("value-wrapper")[0].getElementsByTagName("input")[0];

  linked_span.value = +(+range_slider.value).toFixed(2);
  range_slider.oninput = function(){
    linked_span.value = +(+range_slider.value).toFixed(2);
    range_slider_variables[button_id] = +range_slider.value;
    redraw_canvas_gain("all");
  }
  range_slider_variables[button_id] = 20;
  redraw_canvas_gain("all");

  var slider_bounds = slider.getElementsByClassName("slider-bound");

  var slider_min = slider_bounds[0];
  slider_min.oninput = function(){
    range_slider.min = +slider_min.value;
  }

  var slider_max = slider_bounds[1];
  slider_max.oninput = function(){
    range_slider.max = +slider_max.value;
  }

  linked_span.oninput = function(){
    if(+linked_span.value > +range_slider.max){
      range_slider.max = linked_span.value;
      slider_max.value = linked_span.value;
    }
    if(+linked_span.value < +range_slider.min){
      range_slider.min = linked_span.value;
      slider_min.value = linked_span.value;
    }
    range_slider_variables[button_id] = +linked_span.value;
    range_slider.value = +linked_span.value;
    redraw_canvas_gain("all");
  }

  var equations = button.parentElement.parentElement.parentElement;
  equations.append(slider);
  button.remove();
}

function removeSlider(event){
  var button = event.target;
  var linked_id = button.parentElement.parentElement.getElementsByClassName("range-slider")[0].id.split("_")[1];
  range_slider_variables[linked_id] = 18012001;
  var slider = button.parentElement.parentElement.parentElement;
  slider.remove();
  for(b = 0;b < bode_graphs.length;b++){
    var graph_id = bode_graphs[b].bode_id;
    checkSlider(graph_id);
    redraw_canvas_gain(graph_id);
  }
}

function addNewGraph(event){
  var new_equation_wrapper = document.createElement('div');
  new_equation_wrapper.classList.add('equation-wrapper');
  id_bank += 1;
  var linked_color = color_table[id_bank%color_table.length];
  var mathfield_value = "\\frac{1}{1+p}"
  new_equation_wrapper.innerHTML =
  `
  <div class="equation">
    <input type="checkbox" class="show-graph" style="background: hsl(${linked_color},100%,50%)">
    <math-field class="formula" id="${id_bank}" style="
        font-size: 20px;">${mathfield_value}</math-field>
    <button type="button" class="delete-graph"><i class="material-icons" style="font-size: 38px; color: #b0b0b0">clear</i></button>
  </div>
  <div class="slider-buttons">

  </div>
  <hr>
  `

  var equations_div = document.getElementsByClassName("equations")[0];
  equations_div.append(new_equation_wrapper);

  var new_equation = new_equation_wrapper.getElementsByClassName("equation")[0];
  new_equation.getElementsByClassName("delete-graph")[0].addEventListener('click',removeGraph);
  new_equation.getElementsByClassName("show-graph")[0].addEventListener('change',changeGraphDisplayStatus);

  var new_bode_graph = new bode_graph(id_bank,'1/(1+p)');
  bode_graphs.push(new_bode_graph);
  addNewInformationTab(id_bank);
  //bode_graphs[bode_graphs.length-1].get_complex_p5();
  updateFormulaAndDraw(document.getElementById(id_bank.toString()));
  redraw_canvas_gain(id_bank);
  //redraw();
}

function addNewInformationTab(input_id){
  var tabs_wrapper = document.getElementsByClassName("graph-information-tabs")[0];
  var new_input = document.createElement("input");
  new_input.setAttribute("type","radio");
  new_input.setAttribute("name","tab-inf");
  new_input.id = "graph_" + input_id.toString() + "_info";
  new_input.setAttribute("onchange","updateGraphInformation()");

  var linked_color = color_table[input_id%color_table.length];
  var new_label = document.createElement("label");
  var span_content = "Graph " + input_id.toString();
  new_label.setAttribute("for","graph_" + input_id.toString() + "_info");
  new_label.innerHTML =
  `
  <div style="width:20px;height:20px;border-radius:20px;background:hsl(${linked_color},100%,50%);padding-right:8px;margin-right:6px"></div>
  <span>${span_content}</span>
  `
  new_label.id = "graph_" + input_id.toString() + "_infolabel";

  tabs_wrapper.append(new_input);
  tabs_wrapper.append(new_label);
}

function removeInformationTab(input_id){
  var linked_tab = document.getElementById("graph_" + input_id.toString() + "_info");
  var linked_label = document.getElementById("graph_" + input_id.toString() + "_infolabel");
  linked_tab.remove();
  linked_label.remove();
}

function removeGraph(event){
  var clicked_button = event.target;
  var linked_equation = clicked_button.parentElement.parentElement;
  var linked_id = linked_equation.getElementsByClassName("formula")[0].id;
  removeInformationTab(+linked_id);
  for(i = 0; i<bode_graphs.length;i++){
    var current_graph = bode_graphs[i];
    if(current_graph.bode_id == parseInt(linked_id)){
      bode_graphs.splice(bode_graphs.indexOf(current_graph),1);
      redraw();
    }
  }
  linked_equation.parentElement.remove();
}

function changeGraphDisplayStatus(event){
  var equation_id = event.target.parentElement.getElementsByClassName("formula")[0].id;
  for(i = 0; i < bode_graphs.length; i++){
    var current_graph = bode_graphs[i];
    if(current_graph.bode_id == parseInt(equation_id)){
      current_graph.bode_displaybool = !current_graph.bode_displaybool;
      redraw();
    }
  }
}

function updateFormulaAndDraw(input_element){
  input_element.addEventListener('input',(ev) => {
    var input_element_id = ev.target.id;
    for(i = 0;i < bode_graphs.length;i++){
      var current_bode_graph = bode_graphs[i];
      if(parseInt(input_element_id) == current_bode_graph.bode_id){
        current_bode_graph.bode_formula = ev.target.getValue('ascii-math');

        /*
        //bug since mathlive update hope i can remove it soon
        if(ev.target.value.includes("/")){
          ev.target.value = ev.target.value.replaceAll("/","\\frac{\\placeholder{⬚}}{\\placeholder{⬚}}");
          ev.target.value = ev.target.value.replaceAll("\\frac{}{}","")
        }
        */
        
        checkSlider(input_element_id);
        redraw_canvas_gain(input_element_id);
        break;
      }
    }
  });
}

function createFirstGraph(){
  var new_equation = document.getElementsByClassName("equation")[0];
  new_equation.getElementsByClassName("delete-graph")[0].addEventListener('click',removeGraph);
  new_equation.getElementsByClassName("show-graph")[0].addEventListener('change',changeGraphDisplayStatus);
  updateFormulaAndDraw(document.getElementById(id_bank.toString()));
}

function toolboxMenuToogle(event){
  var toggleElement = document.querySelector('.toolbox');
  toggleElement.classList.toggle('active');
}

function showInputFunction(input){
  if((input == 1 || current_tab == 1) && current_tab != input){
    var toggleElement = document.querySelector('.input-equation');
    toggleElement.classList.toggle('active');
  }
  current_tab = input;
}

function changeStrokeWeight(event){
  var slider_value = document.getElementById("stroke-range").value;
  line_stroke_weight = +slider_value;
  redraw();
}

function changeColorMode(event){
  var checkbox_value = document.getElementById("color-mode-checkbox").checked;
  var graph_space = document.getElementsByClassName("graph-space")[0];
  if(!checkbox_value){
    background_color = color('hsb(0, 0%, 16%)');
    line_color = color('hsb(0, 0%, 38%)');
    text_color = color('hsb(0, 0%, 100%)');
    box_background_color = 120;
    graph_space.setAttribute("style","grid-column: 2;grid-row: 2;background:#292929;")
  }
  else{
    background_color = color('hsb(0, 0%, 100%)');
    line_color = color('hsb(0, 0%, 64%)');
    text_color = color('hsb(0, 0%, 5%)');
    box_background_color = 255;
    graph_space.setAttribute("style","grid-column: 2;grid-row: 2;background:#fff;")
  }
  redraw();
}

function updateToolbox(){
  var bode_tab_value = document.getElementById("bodetab").checked;
  var time_tab_value = document.getElementById("timetab").checked;
  var nyq_tab_value = document.getElementById("nyqtab").checked;
  if(bode_tab_value){
    var math_preferences = document.getElementsByClassName("math-preferences")[0];
    math_preferences.innerHTML =
    `
    <span style="font-weight:500;color:#777777">Math preferences:</span>
    <div class="expression-wrapper">
      <span>x-axis | tenth power from:</span>
      <div class="range-wrapper">
        <input type="text" value="-2">
        <span style="margin: 0 6px 0 6px">to </span>
        <input type="text" value="4">
      </div>
    </div>
    <div class="expression-wrapper">
      <span>y-axis | dB from:</span>
      <div class="range-wrapper">
        <input type="text" value="-60">
        <span style="margin: 0 6px 0 6px">to </span>
        <input type="text" value="60">
      </div>
    </div>
    <div class="expression-wrapper" style="margin-bottom:15px">
      <span>Phase correction:</span>
      <input type="checkbox" id="phase_correction_checkbox" style="width:15px;height:15px;" checked="checked" onchange="redraw_canvas_gain('all')">
    </div>
    `
    var x_inputs = math_preferences.getElementsByClassName("range-wrapper")[0].getElementsByTagName("input");
    var x_min = x_inputs[0];
    var x_max = x_inputs[1];
    x_min.oninput = function(){
      var min_tenth_power_value = roundup_decimal(x_min.value);
      var max_tenth_power_value = roundup_decimal(x_max.value);
      min_10power = min_tenth_power_value;
      x_case_gain = max_tenth_power_value - min_tenth_power_value;
      redraw_canvas_gain("all");
    }
    x_max.oninput = function(){
      var min_tenth_power_value = roundup_decimal(x_min.value);
      var max_tenth_power_value = roundup_decimal(x_max.value);
      x_case_gain = max_tenth_power_value - min_tenth_power_value;
      redraw_canvas_gain("all");
    }
    var y_inputs = math_preferences.getElementsByClassName("range-wrapper")[1].getElementsByTagName("input");
    var y_min = y_inputs[0];
    var y_max = y_inputs[1];
    y_max.oninput = function(){
      var new_max = value_magnet(y_max.value,20);
      var new_min = value_magnet(y_min.value,20);
      gain_upper_bound = new_max;
      y_case_gain = (new_max - new_min)/20;
      redraw_canvas_gain("all");
    }
    y_min.oninput = function(){
      var new_max = value_magnet(y_max.value,20);
      var new_min = value_magnet(y_min.value,20);
      y_case_gain = (new_max - new_min)/20;
      redraw_canvas_gain("all");
    }
  }

  else if(time_tab_value){
    var math_preferences = document.getElementsByClassName("math-preferences")[0];
    math_preferences.innerHTML =
    `
    <span style="font-weight:500;color:#777777">Math preferences:</span>
    <div class="expression-wrapper">
      <span>x-axis | time from:</span>
      <div class="range-wrapper">
        <span style="font-size:14px;margin-top:2px;font-family:Arial">0</span>
        <span style="margin: 0 6px 0 6px">to </span>
        <input type="text" value="10">
      </div>
    </div>
    <div class="expression-wrapper">
      <span>y-axis | from:</span>
      <div class="range-wrapper">
        <input type="text" value="0">
        <span style="margin: 0 6px 0 6px">to </span>
        <input type="text" value="10">
      </div>
    </div>
    <div class="expression-wrapper">
      <span>Graph precision:</span>
      <input type="range" id="precision-range" name="" value="4" step="1" min="1" max="6" onchange="changeStrokeWeight()">
    </div>
    <div class="expression-wrapper">
      <span>Automatic range:</span>
      <input id="automatic-range-time" type="checkbox" name="" value="" style="width:15px;height:15px;" checked="checked">
    </div>
    <div class="expression-wrapper">
      <span>Additional information:</span>
      <input id="addition-information" type="checkbox" name="" value="" style="width:15px;height:15px;" checked="checked">
    </div>

    `
    var time_input = math_preferences.getElementsByClassName("range-wrapper")[0].getElementsByTagName("input")[0];
    var auto_range_checkbox = document.getElementById("automatic-range-time");
    var precision_range = document.getElementById("precision-range");
    var timerep_inputs = math_preferences.getElementsByClassName("range-wrapper")[1].getElementsByTagName("input");
    var timerep_min = timerep_inputs[0];
    var timerep_max = timerep_inputs[1];

    precision_range.onchange = function(){
      precision = 7 - precision_range.value;
      redraw_canvas_gain("all");
      console.log(precision);
    }

    auto_range_checkbox.onchange = function(){
      if(!auto_range_checkbox.checked){
        max_y_timerep = timerep_max.value;
        min_y_timerep = timerep_min.value;
      }
      redraw_canvas_gain("all");
    }

    timerep_max.onchange = function(){
      if(!isNaN(timerep_max.value)){
        max_y_timerep = timerep_max.value;
        redraw_canvas_gain("all");
      }
    }

    timerep_min.onchange = function(){
      if(!isNaN(timerep_min.value)){
        min_y_timerep = timerep_min.value;
        redraw_canvas_gain("all");
      }
    }

    time_input.oninput = function(){
      max_x_timerep = time_input.value;
      if(max_x_timerep != 0){
        redraw_canvas_gain("all");
      }
    }
  }

  else if(nyq_tab_value){
    var math_preferences = document.getElementsByClassName("math-preferences")[0];
    math_preferences.innerHTML =
    `
    <span style="font-weight:500;color:#777777">Math preferences:</span>
    <div class="expression-wrapper">
      <span>x-axis | from:</span>
      <div class="range-wrapper">
        <input type="text" value="-1">
        <span style="margin: 0 6px 0 6px">to </span>
        <input type="text" value="1">
      </div>
    </div>
    <div class="expression-wrapper">
      <span>y-axis | max/min:</span>
      <div class="range-wrapper">
        <span style="margin: 0 6px 0 0">at </span>
        <input type="text" value="1">
      </div>
    </div>
    <div class="expression-wrapper">
      <span>Automatic range:</span>
      <input id="automatic-range-nyq" type="checkbox" name="" value="" style="width:15px;height:15px;" checked="checked">
    </div>
    `
    var auto_range_checkbox = document.getElementById("automatic-range-nyq");
    var range_inputs = math_preferences.getElementsByClassName("range-wrapper");
    var x_inputs = range_inputs[0].getElementsByTagName("input");
    var y_inputs = range_inputs[1].getElementsByTagName("input");
    var x_min = x_inputs[0];
    var x_max = x_inputs[1];
    var y_min = y_inputs[0];

    auto_range_checkbox.onchange = function(){
      if(!auto_range_checkbox.checked){
        min_nyquist_x = x_min.value;
        max_nyquist_x = x_max.value;
        max_nyquist_y = y_min.value;
      }
      redraw_canvas_gain("all");
    }

    x_min.oninput = function(){
      if(!isNaN(x_min.value)){
        min_nyquist_x = x_min.value;
        redraw_canvas_gain("all");
      }
    }

    x_max.oninput = function(){
      if(!isNaN(x_max.value)){
        max_nyquist_x = x_max.value;
        redraw_canvas_gain("all");
      }
    }

    y_min.oninput = function(){
      if(!isNaN(y_min.value) || y_min.value == 0){
        min_nyquist_y = 0;
        max_nyquist_y = y_min.value;
        redraw_canvas_gain("all");
      }
    }
  }
}

function updateInputFormulaFromList(event){
  var selected_input = document.getElementById("input-choices").value;
  var input_equation = document.getElementById("input-formula");
  switch(selected_input){
    case 'Ramp':
      input_formula = "1/(p^2)";
      input_equation.value = "\\frac{1}{p^2}";
      break;
    case 'Unit step':
      input_formula = "1/p";
      input_equation.value = "\\frac{1}{p}";
      break;
    case 'Impulse':
      input_formula = "1";
      input_equation.value = "1";
      break;
    case 'Oscillation':
      input_formula = "1/(1 + p^2)"
      input_equation.value = "\\frac{1}{1 + p^2}";
      break;

  }
  redraw_canvas_gain("all");
}

function updateGraphInformation(){
  var tabs_wrapper = document.getElementsByClassName("graph-information-tabs")[0];
  var inputs = tabs_wrapper.getElementsByTagName('input');
  var sub_information = document.getElementsByClassName("sub-information");
  var phase = sub_information[0].getElementsByClassName("value")[0];
  var gain_cross = sub_information[0].getElementsByClassName("value")[1];
  var gain = sub_information[1].getElementsByClassName("value")[0];
  var phase_cross = sub_information[1].getElementsByClassName("value")[1];
  var settling_time = sub_information[2].getElementsByClassName("value")[0];
  for(h = 0; h < inputs.length; h++){
    if(inputs[h].checked){
      var input_id = +inputs[h].id.split("_")[1];
      var current_graph;
      for(j = 0;j < bode_graphs.length;j++){
        if(bode_graphs[j].bode_id == input_id){
          current_graph = bode_graphs[j];
        }
      }
      if(isNaN(current_graph.bode_phase_margin)){
        phase.innerHTML = "NaN";
        gain_cross.innerHTML = "NaN";
      }
      else{
        phase.innerHTML = current_graph.bode_phase_margin.toFixed(2) + "°";
        gain_cross.innerHTML = current_graph.bode_gain_crossover_freq.toFixed(2);
      }
      if(isNaN(current_graph.bode_gain_margin)){
        gain.innerHTML = "NaN";
        phase_cross.innerHTML = "NaN";
      }
      else{
        gain.innerHTML = current_graph.bode_gain_margin.toFixed(2) + "dB";
        phase_cross.innerHTML = current_graph.bode_phase_crossover_freq.toFixed(2);
      }
      if(isNaN(current_graph.bode_settling_time)){
        settling_time.innerHTML = "NaN";
      }
      else{
        settling_time.innerHTML = current_graph.bode_settling_time.toFixed(3) + "s";
      }
    }
  }
}
