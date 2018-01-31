
export default class Timer{
  constructor(callback,interval){
    
    this.callback=callback;
    this.interval=interval;
    this.stopped=true;
    
    //counts how many callbacks are due
    this.pending_callbacks=0;
  }
  
  setInterval(interval){
      this.interval=interval;
  }
  
  internal_callback(){
      this.pending_callbacks=Math.max(0,this.pending_callbacks-1);

      if(!this.stopped && this.pending_callbacks==0){
        this.pending_callbacks++;
        window.setTimeout(this.internal_callback.bind(this),this.interval);
        this.callback();

      }

  }

  start(){
      if(this.stopped){
  		  this.stopped=false;
  		  if(this.pending_callbacks==0){
  		  	this.internal_callback();
  		  }
      }
  }

  stop(){
      this.stopped=true;
  }

}