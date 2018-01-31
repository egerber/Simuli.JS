// Register all types to be serialized here
import $ from 'jquery';


//List all object types here that need to be deserialized in order to convert them into proper objects

var Types = {};


export function deserialize(json){
  return JSON.parse(json,function(key, value) {
  	if(key==='' && value.hasOwnProperty("__type")){
  		return Types[value.__type].revive(value);//Types[value.__type].revive(value);
  	}else{
  		return value;
  	}
  });
}


export function saveJSON(json, name) {
    var a = document.createElement("a");
    var file = new Blob([json], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}
