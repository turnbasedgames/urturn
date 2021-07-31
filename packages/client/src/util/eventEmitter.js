class EventEmitter {
  constructor(){
    this.listeners = {}
  }

  on(eventName, cb){
    if(this.listeners[eventName]){
      this.listeners[eventName].add(cb);
    }else{
      this.listeners[eventName] = new Set([cb]);
    }
  }

  off(eventName, cb){
    if(this.listeners[eventName]){
      this.listeners[eventName].delete(cb);
      if(this.listeners[eventName].size === 0){
        delete this.listeners[eventName];
      }
    }
  }

  emit(eventName, data){
    if(this.listeners[eventName]){
      this.listeners[eventName].forEach(cb => {
        try{
          cb(data);
        } catch {}
      });
    }
  }
}

module.exports = EventEmitter;
