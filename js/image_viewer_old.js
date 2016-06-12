/*
 * @Class ImageViewer
 * This image viewer is for viewing the image that we are editing.
 * The image is live inside an svg canvas. And it shall connect to the backend with model
 * The parent shall be an d3.select('svg') 
 * And the model is for communication between frontend and backend
 * The images could zoomin zoomout and drag.
 * @TODO Add rotation and better zoom behaviour
 * @TODO Add boundary about the zoom 
 * @TODO multiple layer support
 */
const ImageViewer = function(common, parent){
    this.max_zoom = 3;
    this.min_zoom = -3;
    
    this.parent = parent;
    this.background = this.parent.append('g').classed('background', true);
    const s = 20;
    const pattern = this.background.append('defs')
        .append('pattern').attr({id: 'checker_pattern', width: s, height: s, patternUnits: 'userSpaceOnUse'});
    pattern.append('rect').attr({fill: 'black', x: 0, y: 0, width: s/2, height: s/2, opacity: 0.2});
    pattern.append('rect').attr({fill: 'black', x: s/2, y: s/2, width: s/2, height: s/2, opacity: 0.2});
    this.background.append('rect').attr({fill: 'url(#checker_pattern)', x: 0, y: 0, height: '100%', width: '100%'});
        
    // this.model = model;
    this.common = common;
    this.zoom_group = parent.append('g').datum({zoom: 0}).classed('zoomlevel', true);
    this.foreign_obj = this.zoom_group.append('foreignObject').datum({x: 0, y: 0})
                            .classed('foreign', true);
    this.image = this.foreign_obj.append('xhtml:canvas');
    this.image.style({'backface-visibility': 'hidden',
                     'perspective': 1000,
                     'transform-origin': 'top left'});
    this.zoom = d3.behavior.zoom().on('zoom', this.zoomend.bind(this));
    this.image.call(this.zoom);
    // this.model.imageUpdated.connect(this.update_image.bind(this));  
    common.subscribe(this.update_image.bind(this));
        
    this.drag = d3.behavior.drag().origin(function(d){return d});
    // this.foreign_obj.call(this.drag);
}
ImageViewer.prototype.zoomend = function(){
    var transform = `translate3d(${d3.event.translate[0]}px, ${d3.event.translate[1]}px, 0) scale3d(${d3.event.scale}, ${d3.event.scale}, 1)`;
    this.image.style('transform', transform);
}

ImageViewer.prototype.clear = function(){
    this.common.unsubsribe(this.update_image.bind(this));
    this.background.remove();
    this.zoom_group.remove();
}
/**
 *  Callback from the backend, once registered, and communication back and forth
 */
ImageViewer.prototype.update_image = function(image_data){
    if (image_data.type != 'image') return;
    console.log(image_data);
    // if (!(image_data.height && image_data.width && image_data.data)) return;
    var height = image_data.height;
    var width = image_data.width;
    var image = new ImageData(new Uint8ClampedArray(image_data.data), width, height);
    this.foreign_obj
        .attr('height', height)    
        .attr('width', width);
    this.image.attr('height', height)
            .attr('width', width);
    var ctx = this.image.node().getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(image, 0, 0);
    window.get_image = image;
}

/**
 *  Change the zoom-in level. 
 *  The value is 2 based
 *  @param amount Num amount +1 means 2x the size as before until certain point (max -> x8 min -> x1/8)
 */
ImageViewer.prototype.zoom_change = function(amount){
    var max_zoom = this.max_zoom;
    var min_zoom = this.min_zoom;
    this.zoom_group.transition().attr('transform', function(d){

        d.zoom = Math.max(min_zoom, Math.min(max_zoom, d.zoom+amount));

        return "scale("+Math.pow(2, d.zoom)+")"; 
    });
}

/**
 *  callback function
 */
ImageViewer.prototype.drag_start = function(d){
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

/**
 *  callback function
 */
ImageViewer.prototype.dragging = function(d){
    d3.select(this).attr('x', function(d){
        d.x = d3.event.x;
        return d.x;
    }).attr('y', function(d){
        d.y = d3.event.y;
       return d.y;
    });
}

/**
 *  callback function
 */
ImageViewer.prototype.drag_end = function(d){
    d3.select(this).classed("dragging", false);
}


/**
 *  enable the mouse dragging behaviour of the image
 */
ImageViewer.prototype.enable_drag = function(){
    this.disable();
    this.drag.on('drag', this.dragging)
            .on('dragstart', this.drag_start)
            .on('dragend', this.drag_end);
}

/*
 *  disable the mouse dragging behaviour of the image
 *  diable the zoom-in behaviour
 *  diable the zoom-out behaviour
 */
ImageViewer.prototype.disable = function(){
    this.drag.on('drag', null)
            .on('dragstart', null)
            .on('dragend', null);
}
