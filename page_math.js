var range_slider_variables = [18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001,18012001];
var range_slider_alphabet = ["a",'b','c','d','e','f','g','h','i','j','k','l','m','n','o','q','r','s','t','u','v','w','x','y','z'];

var buffer_formula = 0;
var input_formula = "1/p";

function getComplexValues(freq){
  jomega = freq.toString().concat('','i');
  jomega = '(m)'.replace('m',jomega);
  buffer_formula = buffer_formula.replace('⋅','');
  //Can make it faster for the upcoming for loop by creating the string of the function just once
  function_new_value = buffer_formula.replaceAll('p',jomega);
  complex_value = math.complex(0,0);
  try{
    complex_value = math.evaluate(function_new_value);
    return complex_value;
  }
  catch(error){
  }
}

function replaceLetterByValue(input_bode_formula){
  var output = true;
  buffer_formula = input_bode_formula;
  for(i = 0;i < range_slider_alphabet.length;i++){
    var current_letter = range_slider_alphabet[i];
    if(buffer_formula.includes(current_letter)){
      if(range_slider_variables[i] != 18012001){
        buffer_formula = buffer_formula.replaceAll(current_letter,range_slider_variables[i]);
      }
      else{
        output = false;
      }
    }
  }
  return output;
}

function getTimeValues(time){
  var current_formula = "(" + input_formula + ")" + "(" + buffer_formula + ")"

  var v = [1/12,-385/12,1279,-46871/3,505465/6,-473915/2,1127735/3,-1020215/3,328125/2,-65625/2];

  ln2 = 0.69314718056;
  sum = 0;

  for(j = 1;j<=10;j++){
    new_p = j*ln2/time;
    new_p = '(m)'.replace('m',new_p.toString());
    current_formula = current_formula.replace('⋅','');
    new_function_value = current_formula.replaceAll('p',new_p);
    sum += v[j-1]*math.evaluate(new_function_value);
  }

  return ln2 * sum/time;
}

function findOmegaZero(input_array){
  var a_bound = min_10power;
  var b_bound = min_10power + x_case_gain;
  var f_a = buffer_formula.replaceAll('p','(i*' + pow(10,a_bound).toString() + ')');
  var f_b = buffer_formula.replaceAll('p','(i*' + pow(10,b_bound).toString() + ')');
  f_a = 20*log(math.evaluate(f_a).toPolar().r)/log(10);
  f_b = 20*log(math.evaluate(f_b).toPolar().r)/log(10);
  if(f_a * f_b < 0){
    for(h = 0;h < 20;h++){
      var mid_point = (a_bound + b_bound)/2;
      f_mid = buffer_formula.replaceAll('p','(i*' + pow(10,mid_point).toString() + ')');
      f_mid = 20*log(math.evaluate(f_mid).toPolar().r)/log(10);
      if(f_mid * f_a < 0){
        b_bound = mid_point;
      }
      else{
        a_bound = mid_point;
      }
    }
    a_bound = (a_bound + b_bound)/2;
    //var output = buffer_formula.replaceAll('p','(i*' + pow(10,a_bound).toString() + ')');
    //output = math.evaluate(output).toPolar().phi;
    var linked_array_pos = map(a_bound,min_10power,min_10power + x_case_gain,0,graph_width-1);
    var output = input_array[ceil(linked_array_pos)];
    return [output*180/3.14159 + 180, pow(10,a_bound)];
  }
  else{
    return NaN
  }
}

function findOmega180(input_array){
  var a_bound = min_10power;
  var b_bound = min_10power + x_case_gain;
  var f_a = input_array[ceil(map(a_bound,min_10power,min_10power + x_case_gain,0,graph_width-1))] + 3.14159;
  var f_b = input_array[ceil(map(b_bound,min_10power,min_10power + x_case_gain,0,graph_width-1))] + 3.14159;
  if(f_a * f_b < 0 && abs(f_a) > 0.005 && abs(f_b) > 0.005){
    for(h = 0;h < 20;h++){
      var mid_point = (a_bound + b_bound)/2;
      var f_mid = input_array[ceil(map(mid_point,min_10power,min_10power + x_case_gain,0,graph_width-1))] + 3.14159;
      if(f_mid * f_a < 0){
        b_bound = mid_point;
      }
      else{
        a_bound = mid_point
      }
    }
    a_bound = (a_bound + b_bound)/2;
    var output = buffer_formula.replaceAll('p','(i*' + pow(10,a_bound).toString() + ')');
    output = -20*log(math.evaluate(output).toPolar().r)/log(10);
    console.log(pow(10,a_bound));
    return [output,pow(10,a_bound)];
  }
  else{
    return NaN;
  }
}

function fivePercentTimeResponse(input_array){
  var final_value = +getTimeValues(max_x_timerep + 50).toFixed(3);
  var values = [];
  for(h = 0;h < input_array.length;h++){
    var ratio = abs(input_array[h] - final_value)/final_value;
    if(abs(ratio - 0.05) < 0.001){
      values.push(map(h,0,input_array.length,0,max_x_timerep));
    }
  }
  if(values.length == 0){
    return NaN;
  }
  else{
    return values[values.length-1];
  }
}
