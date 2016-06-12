const ImageViewer = function(common, parent){
    this.height = 600;
    this.width = 600;
    this.parent = parent;
    this.layers = new Map();
    this.background = this.create_background();
    this.zoom = d3.behavior.zoom();
    this.parent.call(this.zoom);
    common.subscribe(this.update_image.bind(this));
}

ImageViewer.prototype.update_image = function(image_data){
    if (image_data.type != 'image') return;
    var height = image_data.height;
    var width = image_data.width;
    var image = new ImageData(new Uint8ClampedArray(image_data.data), width, height);
    var id = image_data.id || 'default';
    var canvas = this.layers.get(id);
    canvas.attr('height', height)
          .attr('width', width);
    var ctx = canvas.node().getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(image, 0, 0);
}
ImageViewer.prototype.reorder_layers = function(order_list){
    this.parent.selectAll('canvas.layer')
            .sort((a, b)=> order_list.get(a.id)-order_list.get(b.id));
}

ImageViewer.prototype.create_layer = function(id){
    var canvas = this.parent.append('canvas').classed('layer', true)
        .datum({height: 0, width: 0, id: id});
    this.layers.set(id, canvas);
}
ImageViewer.prototype.zoomend = function(){
    var transform = `translate3d(${d3.event.translate[0]}px, ${d3.event.translate[1]}px, 0) scale3d(${d3.event.scale}, ${d3.event.scale}, 1)`;
    this.parent.selectAll('canvas.layer').style('transform', transform);
}
ImageViewer.prototype.enable = function(){
    this.zoom.on('zoom', this.zoomend.bind(this));
}
ImageViewer.prototype.disable = function(){
    this.zoom.on('zoom', null);
}

ImageViewer.prototype.create_background = function(){
    var background = this.parent.append('svg:svg')
                            .style({position: 'absolute', top: 0, left: 0})
                            .attr('height', this.height) 
                            .attr('width', this.width);
    const s = 20;
    var pattern = background.append('defs')
                            .append('pattern').attr({
                                id: 'checker_pattern', 
                                width: s,
                                height: s, 
                                patternUnits: 'userSpaceOnUse'
                            });
    pattern.append('rect').attr({
                fill: 'black',
                x: 0,
                y: 0,
                width: s/2,
                height: s/2,
                opacity: 0.2
            });
    pattern.append('rect').attr({
        fill: 'black',
        x: s/2,
        y: s/2,
        width: s/2,
        height: s/2,
        opacity: 0.2});
        background.append('rect').attr({
            fill: 'url(#checker_pattern)',
            x: 0,
            y: 0,
            height: '100%',
            width: '100%'});
    return background;
}
