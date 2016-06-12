const Cursor = function(parent){
    this.parent = parent;
}
const Cursor_const = {
    'brush' : '/css/cursor-brush.svg',
    'zoomin' : '/css/cursor-zoomin.svg',
    'zoomout' : '/css/cursor-zoomout.svg',
    'polygon' : '/css/cursor-polygon.svg',
}
Cursor.prototype.change_cursor = function(id){
    if (Cursor_const[id]){
        var cursor_style = 'url('+Cursor_const[id]+'), auto';
        this.parent.style('cursor', cursor_style);
    }else{
        this.parent.style('cursor', 'auto'); 
    }
}
