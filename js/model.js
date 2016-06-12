var Model = function(){
    this.choseFile = function(){
        // for (var cb of this.callbacks){
        for (var i=0; i<this.callbacks; i++){
            var cb = this.callbacks[i];
            cb(); 
        } 
    }.bind(this);
    this.callbacks = [];
    this.imageUpdated = {
        connect: function(fn){
            this.callbacks.push(fn);
        }.bind(this),
    };
    this.pixels = {
        width: 777,
        height: 782,
        assignToHTMLImageElement: function(imgtag){
            console.log('triggered');
            imgtag.src = '/image/wolf.jpg';
        }
    }

}
